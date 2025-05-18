
import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, Download, SortDesc, SortAsc, 
  ChevronDown, ShoppingBag, AlertCircle, BarChartHorizontalBig
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons = {
  income: { icon: "trending-up", color: "#06D6A0", label: "Income" },
  groceries: { icon: "shopping-bag", color: "#83C5BE", label: "Groceries" },
  dining: { icon: "utensils", color: "#FF6B6B", label: "Dining" },
  transport: { icon: "car", color: "#FFD166", label: "Transport" },
  shopping: { icon: "shopping-cart", color: "#06D6A0", label: "Shopping" },
  entertainment: { icon: "film", color: "#118AB2", label: "Entertainment" },
  utilities: { icon: "zap", color: "#073B4C", label: "Utilities" },
  housing: { icon: "home", color: "#8338EC", label: "Housing" },
  healthcare: { icon: "activity", color: "#06D6A0", label: "Healthcare" },
  education: { icon: "book-open", color: "#118AB2", label: "Education" },
  travel: { icon: "map", color: "#FF6B6B", label: "Travel" },
  savings: { icon: "piggy-bank", color: "#FFD166", label: "Savings" },
  other: { icon: "more-horizontal", color: "#14213D", label: "Other" },
  non_cashflow_income: { icon: "bar-chart-horizontal-big", color: "#6c757d", label: "Non-Cashflow Income"},
  non_cashflow_expense: { icon: "bar-chart-horizontal-big", color: "#6c757d", label: "Non-Cashflow Expense"},
};
const LucideBarChartHorizontalBig = BarChartHorizontalBig;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  useEffect(() => {
    loadData();
  }, [selectedMonth]);
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      const userPrefs = await UserPreference.filter({});
      if (userPrefs.length > 0 && userPrefs[0].selected_month) {
        setSelectedMonth(userPrefs[0].selected_month);
      }
      
      let transactionData = await Transaction.filter({ month: selectedMonth }, '-date');
      
      setTransactions(transactionData);
      setFilteredTransactions(transactionData);
    } catch (error)
    {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, selectedType, sortOrder, transactions]);
  
  const applyFilters = () => {
    let filtered = [...transactions];

    if (selectedCategory !== "non_cashflow_income" && selectedCategory !== "non_cashflow_expense") {
      if (selectedType === "all" || selectedType === "income" || selectedType === "expense") {
        filtered = filtered.filter(t => !t.is_non_cashflow);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (selectedType === "income" && selectedCategory !== "non_cashflow_income") {
      filtered = filtered.filter(t => t.amount > 0 && !t.is_non_cashflow);
    } else if (selectedType === "expense" && selectedCategory !== "non_cashflow_expense") {
      filtered = filtered.filter(t => t.amount < 0 && !t.is_non_cashflow);
    }
    
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOrder === "highest") {
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    } else if (sortOrder === "lowest") {
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    }
    
    setFilteredTransactions(filtered);
  };
  
  const formatName = (name) => {
    if (!name) return "Uncategorized";
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  const getCategoryIcon = (category) => {
    const iconInfo = category ? categoryIcons[category.toLowerCase()] : categoryIcons.other;
    const safeIconInfo = iconInfo || categoryIcons.other;
    const IconComponent = safeIconInfo.icon === "bar-chart-horizontal-big" ? LucideBarChartHorizontalBig : ShoppingBag;
    return <IconComponent style={{ color: safeIconInfo.color }} className="w-4 h-4" />;
  };
  
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
  
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    if (sortOrder === "newest" || sortOrder === "highest" || sortOrder === "lowest") {
      return new Date(b) - new Date(a);
    } else {
      return new Date(a) - new Date(b);
    }
  });

  return (
    <div className="min-h-screen bg-[var(--surface)] p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Transactions</h1>
          <p className="text-[var(--text-secondary)]">View and manage your financial transactions</p>
        </div>
        
        <div className="p-4 mb-6 glass-card relative z-20">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)] w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)] w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger className="w-[130px] glass-card !py-2.5 !px-3 !rounded-lg text-[var(--text-secondary)] hover:!shadow-md">
                  <div className="flex items-center">
                    {sortOrder === "newest" || sortOrder === "oldest" ? (
                      sortOrder === "newest" ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />
                    ) : null}
                    <span>{sortOrder === "newest" ? "Newest" : 
                           sortOrder === "oldest" ? "Oldest" : 
                           sortOrder === "highest" ? "Highest" : "Lowest"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-card border-none shadow-2xl">
                   <SelectItem value="newest" className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40">Newest First</SelectItem>
                   <SelectItem value="oldest" className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40">Oldest First</SelectItem>
                   <SelectItem value="highest" className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40">Highest First</SelectItem>
                   <SelectItem value="lowest" className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40">Lowest First</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={cn("glass-card !p-2.5 !rounded-lg text-[var(--text-secondary)] hover:!shadow-md", showFilters && "bg-white/30 backdrop-blur-md")}
              >
                <Filter className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="glass-card !p-2.5 !rounded-lg text-[var(--text-secondary)] hover:!shadow-md">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-[var(--divider)]">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Transaction Type</span>
                      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                        <TabsList className="grid grid-cols-3 w-full glass-card !rounded-lg p-1">
                          <TabsTrigger value="all" className="data-[state=active]:btn-gradient-primary data-[state=active]:text-white data-[state=inactive]:text-[var(--text-secondary)] rounded-md hover:bg-white/20 py-1.5">All</TabsTrigger>
                          <TabsTrigger value="income" className="data-[state=active]:btn-gradient-primary data-[state=active]:text-white data-[state=inactive]:text-[var(--text-secondary)] rounded-md hover:bg-white/20 py-1.5">Income</TabsTrigger>
                          <TabsTrigger value="expense" className="data-[state=active]:btn-gradient-primary data-[state=active]:text-white data-[state=inactive]:text-[var(--text-secondary)] rounded-md hover:bg-white/20 py-1.5">Expenses</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Category</span>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all ${selectedCategory === "all" ? "btn-gradient-primary text-white" : "glass-card text-[var(--text-secondary)] hover:shadow-md"}`}
                          onClick={() => setSelectedCategory("all")}
                        >
                          All
                        </Badge>
                        {Object.entries(categoryIcons).map(([key, value]) => (
                          <Badge
                            key={key}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all ${
                              selectedCategory === key 
                                ? "btn-gradient-primary text-white" 
                                : "glass-card text-[var(--text-secondary)] hover:shadow-md"
                            }`}
                            onClick={() => setSelectedCategory(key)}
                          >
                            {value.label || formatName(key)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <Skeleton className="h-5 w-1/3 bg-white/30 rounded mb-4"></Skeleton>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Skeleton className="w-8 h-8 bg-white/30 rounded-full mr-3"></Skeleton>
                        <div>
                          <Skeleton className="h-4 w-40 bg-white/30 rounded mb-1"></Skeleton>
                          <Skeleton className="h-3 w-24 bg-white/30 rounded"></Skeleton>
                        </div>
                      </div>
                      <Skeleton className="h-5 w-16 bg-white/30 rounded"></Skeleton>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="glass-card p-8 text-center">
             <Alert className="mb-4 glass-card !bg-amber-500/20 !border-amber-500/40 text-amber-700 p-4 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                No transactions found for the selected filters or for {selectedMonth}.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedType("all");
              }}
              className="btn-gradient btn-gradient-accent"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {sortedDates.map(date => (
              <div key={date} className="glass-card p-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                  {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                </h3>
                
                <div className="space-y-1 divide-y divide-[var(--divider)]/50">
                  {groupedTransactions[date].map(transaction => (
                    <motion.div
                      key={transaction.id}
                      whileHover={{ x: 2, backgroundColor: "rgba(255,255,255,0.1)" }}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0 rounded-md transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-white/30 shadow-inner"
                        >
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <p className="font-medium text-[var(--text-primary)] truncate">{transaction.description}</p>
                                {transaction.is_non_cashflow && (
                                    <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0 bg-gray-100 text-gray-500 border-gray-300 whitespace-nowrap">NCF</Badge>
                                )}
                            </div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {categoryIcons[transaction.category]?.label || formatName(transaction.category)}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold shrink-0 ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {transaction.currency || "AED"}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
