import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Info, SortAsc, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subMonths, parseISO } from "date-fns"; // Removed addMonths since we won't show future months
import { Transaction } from "@/api/entities";
import { Budget } from "@/api/entities";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function CategoryHistoryDrawer({
  isOpen,
  onClose,
  category,
  categoryIcon,
  categoryColor
}) {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // date, amount, or change
  
  useEffect(() => {
    if (isOpen && category) {
      fetchHistoricalData();
    }
  }, [isOpen, category]);
  
  const fetchHistoricalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date();
      const currentMonth = format(currentDate, "yyyy-MM");
      
      // Fetch transactions for the last 12 months (no future months)
      const months = [];
      for (let i = 0; i < 12; i++) {
        const monthDate = subMonths(currentDate, i);
        months.push(format(monthDate, "yyyy-MM"));
      }
      
      const [transactions, budgets] = await Promise.all([
        Transaction.filter({ category }),
        Budget.filter({ category })
      ]);
      
      // Group transactions by month
      const spendingByMonth = {};
      months.forEach(month => {
        spendingByMonth[month] = 0;
      });
      
      transactions.forEach(tx => {
        const txMonth = tx.month;
        if (spendingByMonth.hasOwnProperty(txMonth)) {
          spendingByMonth[txMonth] += tx.amount < 0 ? Math.abs(tx.amount) : 0;
        }
      });
      
      // Get the budget amount for each month
      const budgetByMonth = {};
      budgets.forEach(budget => {
        budgetByMonth[budget.month] = budget.amount;
      });
      
      // Calculate month-over-month changes and create the data array
      const data = months.map((month, index) => {
        const spent = spendingByMonth[month] || 0;
        const budget = budgetByMonth[month] || 0;
        const previousMonthSpent = index < months.length - 1 ? spendingByMonth[months[index + 1]] || 0 : 0;
        
        let changePercent = 0;
        let changeDirection = "same";
        
        if (previousMonthSpent > 0) {
          changePercent = Math.round(((spent - previousMonthSpent) / previousMonthSpent) * 100);
          changeDirection = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "same";
        }
        
        return {
          month,
          monthDisplay: format(new Date(month + "-01"), "MMMM yyyy"), // Full month and year
          spent,
          budget,
          changePercent,
          changeDirection
        };
      });
      
      setHistoryData(data);
    } catch (err) {
      console.error("Error fetching category history:", err);
      setError("Failed to load category history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Find max value for the chart scaling
  const maxSpending = Math.max(...historyData.map(d => d.spent), 1);
  
  // Format category name for display
  const formatCategoryName = (cat) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Sort the history data based on selected criteria
  const getSortedData = () => {
    return [...historyData].sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.spent - a.spent;
        case "change":
          return b.changePercent - a.changePercent;
        default: // "date"
          return new Date(b.month) - new Date(a.month);
      }
    });
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full md:w-[40%] bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 text-gray-500 hover:text-gray-700">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-gray-800">History for {formatCategoryName(category)}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-end)]"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-600">
                  <p>{error}</p>
                  <Button 
                    onClick={fetchHistoricalData} 
                    className="mt-4 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {/* Chart Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Spending Trend</h3>
                    <div className="h-[250px] relative bg-gray-50 rounded-lg p-4 overflow-hidden">
                      {historyData.length > 0 ? (
                        <div className="h-full flex items-end justify-between">
                          {/* Y-axis labels */}
                          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
                            <span>AED {maxSpending.toLocaleString()}</span>
                            <span>AED {(maxSpending / 2).toLocaleString()}</span>
                            <span>AED 0</span>
                          </div>
                          
                          {/* X-axis (months) + bars */}
                          <div className="absolute left-14 right-4 bottom-0 top-4 flex items-end justify-around">
                            {historyData.slice(0, 6).reverse().map((item) => (
                              <div key={item.month} className="flex flex-col items-center relative group">
                                {/* Bar */}
                                <div 
                                  className="w-12 bg-gradient-to-t from-[var(--primary-start)] to-[var(--primary-end)] rounded-t-sm relative mb-2"
                                  style={{ 
                                    height: `${(item.spent / maxSpending) * 100}%`,
                                    minHeight: '4px'
                                  }}
                                >
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    <div>{item.monthDisplay}: AED {item.spent.toLocaleString()}</div>
                                    {item.changePercent !== 0 && (
                                      <div className={item.changeDirection === 'up' ? 'text-red-300' : 'text-green-300'}>
                                        {item.changeDirection === 'up' ? '↑' : '↓'} {Math.abs(item.changePercent)}% vs previous
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Month label */}
                                <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left h-8 whitespace-nowrap">
                                  {format(parseISO(item.month + "-01"), "MMM yyyy")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No history data available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Monthly Breakdown Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Monthly Breakdown</h3>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Sort by Date</SelectItem>
                          <SelectItem value="amount">Sort by Amount</SelectItem>
                          <SelectItem value="change">Sort by Change %</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 text-sm font-medium text-gray-500 border-b border-gray-200">
                        <div className="px-4 py-3">Month</div>
                        <div className="px-4 py-3 text-center">Spent (AED)</div>
                        <div className="px-4 py-3 text-right">Δ vs. Prev.</div>
                      </div>
                      
                      {/* Table Content */}
                      <div className="divide-y divide-gray-200">
                        {getSortedData().map((item) => (
                          <div key={item.month} className="grid grid-cols-3 text-sm bg-white">
                            <div className="px-4 py-4 font-medium text-gray-900">
                              {item.monthDisplay}
                            </div>
                            <div className="px-4 py-4 text-center">
                              {item.spent.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </div>
                            <div className="px-4 py-4 text-right">
                              {item.changePercent === 0 ? (
                                <span className="text-gray-500">—</span>
                              ) : (
                                <span 
                                  className={item.changeDirection === 'up' 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                  }
                                >
                                  {item.changeDirection === 'up' ? '+' : '–'}
                                  {Math.abs(item.changePercent)}% 
                                  {item.changeDirection === 'up' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-white">
                  Close
                </Button>
                <Button 
                  onClick={onClose} 
                  className="flex-1 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}