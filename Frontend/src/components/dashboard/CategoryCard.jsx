
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ShoppingBag, Utensils, Car, ShoppingCart, Film, Zap, Home, Activity, 
  BookOpen, MapPin, MoreHorizontal, PiggyBank, TrendingUp, ChevronDown, 
  ChevronUp, ArrowRightCircle, Edit, History, Trash2, BarChartHorizontalBig
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Transaction } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import EditTransactionCategoryModal from '../transactions/EditTransactionCategoryModal';

// Helper function to group transactions by week
function groupTransactionsByWeek(transactions) {
  const weeks = {};
  if (!transactions || !transactions.length) return weeks;
  
  transactions.forEach(transaction => {
    if (!transaction.date) return;
    const transDate = parseISO(transaction.date);
    const weekNum = Math.ceil((transDate.getDate()) / 7);
    
    if (!weeks[weekNum]) {
      weeks[weekNum] = {
        transactions: [],
        totalAmount: 0 // Renamed from totalSpent to be more generic for income/expense
      };
    }
    
    weeks[weekNum].transactions.push(transaction);
    // For NCF income, amount is positive. For NCF expense, amount is negative.
    // We sum actual amounts here. The display logic in WeekGroup will handle positive/negative.
    weeks[weekNum].totalAmount += transaction.amount;
  });
  
  return weeks;
}

// Simple transaction item for weekly breakdown
function WeeklyTransactionItem({ transaction, currency, onEditTransaction, isParentNcfCard }) { // Added isParentNcfCard
  return (
    <div className="flex justify-between items-center py-1.5 group hover:bg-gray-50/50 px-1 rounded-md">
      <div className="flex items-center">
        <span className="text-xs text-gray-700 truncate max-w-[120px] sm:max-w-[150px]">{transaction.description}</span>
        {/* Hide NCF badge if it's inside an NCF card already */}
        {transaction.is_non_cashflow && !isParentNcfCard && (
          <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0 bg-gray-100 text-gray-500 border-gray-300">NCF</Badge>
        )}
      </div>
      <div className="flex items-center">
          <span className={`text-xs font-medium mr-2 ${transaction.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {transaction.amount < 0 ? "-" : "+"}{currency} {Math.abs(transaction.amount).toLocaleString()}
          </span>
          <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-700 focus:opacity-100 transition-opacity"
              onClick={() => onEditTransaction(transaction)}
          >
              <Edit className="h-3.5 w-3.5" />
          </Button>
      </div>
    </div>
  );
}


// Week group component for expandable details
function WeekGroup({ weekNumber, weeklyTotalAmount, transactions, currency, onEditTransaction, isNcfIncomeCard, isNcfExpenseCard, isParentNcfCard }) { // Added props
  const [isWeekExpanded, setIsWeekExpanded] = useState(false);

  // Determine display label and amount for the week summary
  let weekSummaryLabel = "Spent:";
  let weekSummaryAmount = Math.abs(weeklyTotalAmount); // Default to absolute for expenses
  let amountColorClass = "text-gray-500";

  if (isNcfIncomeCard) {
    weekSummaryLabel = "Income:";
    weekSummaryAmount = weeklyTotalAmount; // Actual positive value
    amountColorClass = weeklyTotalAmount >= 0 ? "text-green-600" : "text-red-500";
  } else if (isNcfExpenseCard) {
    // "Spent:" is appropriate, weeklyTotalAmount will be negative or zero.
    // We take absolute for display next to "Spent:"
    weekSummaryAmount = Math.abs(weeklyTotalAmount);
    amountColorClass = "text-red-500"; 
  } else { // Regular budget card (expenses)
    weekSummaryAmount = Math.abs(weeklyTotalAmount);
     amountColorClass = "text-gray-500"; // Or apply specific color logic for budget cards if needed
  }


  return (
    <div className="py-2 border-b border-gray-200 last:border-b-0">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsWeekExpanded(!isWeekExpanded)}
      >
        <div>
          <h4 className="text-sm font-medium text-gray-800">Week {weekNumber}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${amountColorClass}`}>
              {weekSummaryLabel} {currency} {weekSummaryAmount.toLocaleString()}
            </span>
            {/* Budget comparison logic is for regular budget cards, not NCF cards */}
            {/*!(isNcfIncomeCard || isNcfExpenseCard) && weeklyBudget > 0 && (
               ... existing budget comparison ...
            )*/}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
        >
          {isWeekExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isWeekExpanded && transactions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-1.5 pl-2 overflow-hidden"
          >
            {transactions.map(tx => (
              <WeeklyTransactionItem key={tx.id} transaction={tx} currency={currency} onEditTransaction={onEditTransaction} isParentNcfCard={isParentNcfCard} />
            ))}
          </motion.div>
        )}
         {isWeekExpanded && transactions.length === 0 && (
            <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-gray-500 italic py-1 pl-2"
            >
                No transactions this week.
            </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}


// Main Category Card Component
export default function CategoryCard({ 
  id, 
  category, 
  budgeted, 
  spent,
  icon,
  color,
  currency = "AED",
  month,
  isExpanded,
  onToggleExpand,
  onEditBudget,
  onDeleteCategory,
  transactionsForCategory,
  onTransactionUpdated,
  toastInstance,
  isNonCashflow = false,
  onViewHistory // Add this prop
}) {
  const [weeklyData, setWeeklyData] = useState({});
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedAccountId = 'all'; 
  const [editingTransaction, setEditingTransaction] = useState(null); 

  const isNcfIncomeCard = isNonCashflow && category === "non_cashflow_income";
  const isNcfExpenseCard = isNonCashflow && category === "non_cashflow_expense";

  const categoryIcons = {
    "shopping-bag": ShoppingBag, "groceries": ShoppingBag,
    "utensils": Utensils, "dining": Utensils,
    "car": Car, "transport": Car,
    "shopping-cart": ShoppingCart, "shopping": ShoppingCart,
    "film": Film, "entertainment": Film,
    "zap": Zap, "utilities": Zap,
    "home": Home, "housing": Home,
    "activity": Activity, "healthcare": Activity,
    "book-open": BookOpen, "education": BookOpen,
    "map": MapPin, "travel": MapPin,
    "piggy-bank": PiggyBank, "savings": PiggyBank,
    "trending-up": TrendingUp, "income": TrendingUp,
    "bar-chart-horizontal-big": BarChartHorizontalBig, "non_cashflow_income": BarChartHorizontalBig, "non_cashflow_expense": BarChartHorizontalBig,
    "other": MoreHorizontal,
  };
  const IconComponent = categoryIcons[icon] || categoryIcons[category.toLowerCase()] || MoreHorizontal;

  useEffect(() => {
    if (isExpanded && transactionsForCategory) {
      fetchTransactionsForCategory();
    }
  }, [isExpanded, category, month, transactionsForCategory]); // transactionsForCategory added as dependency

   const fetchTransactionsForCategory = async () => {
    setIsLoadingTransactions(true);
    try {
      const grouped = groupTransactionsByWeek(transactionsForCategory);
      setWeeklyData(grouped);
    } catch (error) {
      console.error("Error processing transactions for category card:", error);
      if (toastInstance && toastInstance.error) {
        toastInstance.error(`Failed to load transactions for ${category}`);
      }
    } finally {
      setIsLoadingTransactions(false);
    }
  };


  const percentage = budgeted > 0 ? Math.min(100, (spent / budgeted) * 100) : 0;
  const remainingAmount = budgeted - spent;
  const isOverBudget = spent > budgeted && budgeted > 0;

  const handleDeleteConfirm = () => {
    try {
      onDeleteCategory(id); // This will call Dashboard's handleDeleteCategory, which handles its own toast
      setShowDeleteConfirm(false);
    } catch (error) { // This catch might be redundant if onDeleteCategory is robust
      console.error("Error in handleDeleteCategory prop execution:", error);
      if (toastInstance && toastInstance.error) {
        toastInstance.error("Failed to initiate category deletion.");
      }
    }
  };

  // Function to handle opening the edit modal for a transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  // Function to handle successful update from the modal
  const handleModalSuccess = (updatedTx) => {
    // This function should refresh the transaction list or update the specific transaction in the local state.
    // For simplicity, we'll rely on the onTransactionUpdated prop passed from the Dashboard
    // to refresh the entire month's data.
    if (onTransactionUpdated) {
      onTransactionUpdated(updatedTx); // Signal dashboard to reload month data
    }
    if (toastInstance && toastInstance.success) { // Use the passed toast instance
      toastInstance.success("Transaction updated!");
    }
    setEditingTransaction(null); // Close modal
  };

  // This function might not be needed anymore as 'spent' is directly passed as a prop
  // const getSpendingByCategory = (category) => { ... }

  // Format the category name for display
  const formatCategoryName = (cat) => {
    if (cat === "non_cashflow_income") return "Non-Cashflow Income";
    if (cat === "non_cashflow_expense") return "Non-Cashflow Expense";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* 1. Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-[var(--primary-end)]" style={{color: color || 'var(--primary-end)'}}> 
              <IconComponent className="w-full h-full" />
            </div>
            <span className="font-bold text-lg text-gray-800">{formatCategoryName(category)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {!isNonCashflow && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-full"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEditBudget({id, category, amount: budgeted, currency, icon, color})}>
                    <Edit className="w-4 h-4 mr-2" /> Edit Budget...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewHistory(category, icon, color)}> {/* Update this line */}
                    <History className="w-4 h-4 mr-2" /> View History...
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onToggleExpand(id)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* 2. Budget Summary / Total Display */}
        <div className="mb-1">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold" style={{color: color || 'var(--primary-end)'}}>
              {/* For NCF Expense, spent is positive, for NCF Income, spent is positive */}
              {currency} {spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {!isNonCashflow && budgeted > 0 && (
              <span className="text-sm text-gray-500">
                of {currency} {budgeted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
          {!isNonCashflow && budgeted > 0 && (
            <Progress 
              value={percentage} 
              className="h-2 mt-2 rounded-full bg-gray-200"
              indicatorClassName="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-full"
            />
          )}
        </div>

        {/* 3. Remaining Text / NCF Info */}
        {!isNonCashflow && budgeted > 0 && (
          <p className={`text-xs mb-3 ${isOverBudget ? 'text-red-500' : 'text-gray-500'}`}>
            {isOverBudget 
              ? `${currency} ${Math.abs(remainingAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over budget`
              : `${currency} ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining`}
          </p>
        )}
        {isNcfIncomeCard && (
          <p className="text-xs mb-3 text-gray-500">
            Total Non-Cashflow Income
          </p>
        )}
        {isNcfExpenseCard && (
          <p className="text-xs mb-3 text-gray-500">
            Total Non-Cashflow Expenses
          </p>
        )}
        
        {/* 4. Expandable Details */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-4 pt-3 border-t border-gray-200 overflow-hidden"
            >
              {isLoadingTransactions ? (
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </div>
              ) : Object.keys(weeklyData).length > 0 ? (
                <div className="space-y-1 mb-3">
                  {Object.entries(weeklyData)
                    .sort(([weekA], [weekB]) => parseInt(weekA) - parseInt(weekB))
                    .map(([weekNum, data]) => (
                      <WeekGroup
                        key={weekNum}
                        weekNumber={weekNum}
                        weeklyTotalAmount={data.totalAmount} // Use totalAmount
                        // weeklyBudget prop is not relevant for NCF cards for budget comparison
                        transactions={data.transactions} 
                        currency={currency}
                        onEditTransaction={handleEditTransaction}
                        isNcfIncomeCard={isNcfIncomeCard} // Pass NCF type
                        isNcfExpenseCard={isNcfExpenseCard} // Pass NCF type
                        isParentNcfCard={isNonCashflow} // Pass if parent is NCF
                      />
                    ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2 mb-3">
                  No transactions for {formatCategoryName(category)} this month.
                </p>
              )}
              
              <Link 
                to={createPageUrl(`CategoryTransactions?category=${category}&month=${month}${selectedAccountId !== 'all' ? `&source_id=${selectedAccountId}` : ''}`)}
                className="flex items-center justify-center text-xs text-[var(--primary-end)] hover:text-[var(--primary-start)] font-medium"
              >
                View All Transactions for {formatCategoryName(category)} <ArrowRightCircle className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog - only show for regular categories */}
      
      {!isNonCashflow && (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Category Budget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove the {formatCategoryName(category)} budget category? 
                This will delete all budget settings for this category. Transactions will remain but will become uncategorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                Remove Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}


      {/* Edit Transaction Modal */}
      
      {editingTransaction && (
        <EditTransactionCategoryModal
          transaction={editingTransaction}
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
