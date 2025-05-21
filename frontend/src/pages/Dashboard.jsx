
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { FinancialGoal } from "@/api/entities";
import { TransactionSource } from "@/api/entities";
import { format, subMonths, addMonths, parseISO } from "date-fns";
import { Plus, Share2, Download, Edit, AlertTriangle, BarChartHorizontalBig, CreditCard, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ToastProvider } from "@/components/ui/toast";
import { useToast }      from "@/components/ui/use-toast";

import CategoryCard from "../components/dashboard/CategoryCard";
import GoalCard from "../components/dashboard/GoalCard";
import MonthSelector from "../components/dashboard/MonthSelector";
import SummaryCard from "../components/dashboard/SummaryCard";
import AccountList from "../components/dashboard/AccountList";
import SkeletonLoader from "../components/dashboard/SkeletonLoader";
import EditBudgetModal from "../components/budgets/EditBudgetModal";
import AccountFilterDropdown from "../components/dashboard/AccountFilterDropdown";
import EditTransactionCategoryModal from "../components/transactions/EditTransactionCategoryModal";
import CategoryHistoryDrawer from "../components/categories/CategoryHistoryDrawer";
import AddGoalModal from "../components/goals/AddGoalModal";
import AddFundsModal from "../components/goals/AddFundsModal";
import GoalHistoryDrawer from "../components/goals/GoalHistoryDrawer";

function DashboardContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isLoadingUserContext, setIsLoadingUserContext] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgets, setBudgets] = useState([]);
  const [allTransactionsForMonth, setAllTransactionsForMonth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [transactionSources, setTransactionSources] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [selectedIncomeType, setSelectedIncomeType] = useState("all");
  const [selectedExpenseType, setSelectedExpenseType] = useState("all");
  
  const toast = useToast();
  const [weeklyIncomeData, setWeeklyIncomeData] = useState([0,0,0,0]);
  const [weeklyExpenseData, setWeeklyExpenseData] = useState([0,0,0,0]);
  const [weeklyNetData, setWeeklyNetData] = useState([0,0,0,0]);

  const [incomeBreakdown, setIncomeBreakdown] = useState({ expected: 0, unexpected: 0 });
  const [expenseBreakdown, setExpenseBreakdown] = useState({ fixed: 0, variable: 0 });
  
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [showCategoryHistory, setShowCategoryHistory] = useState(false);
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState(null);

  const [editingGoal, setEditingGoal] = useState(null);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [activeGoalForFunds, setActiveGoalForFunds] = useState(null);
  const [isRemovingFunds, setIsRemovingFunds] = useState(false);
  const [goals, setGoals] = useState([]);

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showGoalHistoryDrawer, setShowGoalHistoryDrawer] = useState(false);
  const [selectedGoalForHistory, setSelectedGoalForHistory] = useState(null);

  const [expandedSections, setExpandedSections] = useState({ completedGoals: false });


  useEffect(() => {
    const fetchUserAndCheckOnboarding = async () => {
      setIsLoadingUserContext(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const prefs = await UserPreference.filter({ created_by: currentUser.email });
        if (prefs.length > 0) {
          setPreferences(prefs[0]);
          if (!prefs[0].has_completed_onboarding) {
            navigate(createPageUrl("Onboarding"));
            return; // Stop further execution if redirecting
          }
        } else {
          // No preferences found, might be first login after registration
          // or preference creation failed.
          // Default to redirecting to onboarding.
          navigate(createPageUrl("Onboarding"));
          return; // Stop further execution
        }
        // If onboarding is complete, proceed to load dashboard data
        loadInitialData(currentUser.email); 
      } catch (error) {
        console.error("Error fetching user or preferences:", error);
        // If not logged in or other error, redirect to login (which is the built-in one)
        navigate(createPageUrl("Login"));
      } finally {
        setIsLoadingUserContext(false);
      }
    };

    fetchUserAndCheckOnboarding();
  }, [navigate]);

  useEffect(() => {
    if(user) {
        loadMonthData();
    }
  }, [selectedMonth, user, selectedAccountId]);

  const loadInitialData = async (userEmailForPrefs) => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [userPrefs, sources, financialGoals] = await Promise.all([
        UserPreference.filter({ created_by: userData.email }),
        TransactionSource.list(),
        FinancialGoal.list()
      ]);

      setGoals(financialGoals);
      if (userPrefs.length > 0) {
        setPreferences(userPrefs[0]);
      }
      setTransactionSources(sources);
      
    } catch (error) {
      console.error("Error loading initial dashboard data:", error);
      toast.error("Failed to load initial data.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadMonthData = async () => {
    if(!user) return;
    setIsLoading(true);
    try {
      const [monthTransactions, sources] = await Promise.all([
        Transaction.filter({ month: selectedMonth }),
        TransactionSource.list()
      ]);
      
      // Enhance transactions with source names
      const enhancedTransactions = monthTransactions.map(tx => ({
        ...tx,
        source_name: sources.find(s => s.id === tx.source_id)?.name || "Unknown Account"
      }));
      
      setAllTransactionsForMonth(enhancedTransactions);
      
      // Set income transactions separately
      const incomeOnly = enhancedTransactions.filter(t => t.amount > 0 && !t.is_non_cashflow);
      setIncomeTransactions(incomeOnly);

      const [monthBudgets, userGoals] = await Promise.all([
            Budget.filter({ month: selectedMonth }),
            FinancialGoal.list()
        ]);
        
        const uniqueBudgets = monthBudgets.reduce((acc, budget) => {
            acc[budget.category] = budget;
            return acc;
        }, {});
        
        setBudgets(Object.values(uniqueBudgets));
        setGoals(userGoals);

    } catch (error) {
        console.error("Error loading month-specific data:", error);
        toast.error("Failed to load data for this month.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowEditBudgetModal(true);
  };

  const handleAddCategory = () => {
    setEditingBudget(null); // For creating a new budget
    setShowEditBudgetModal(true);
  };

  const handleDeleteCategory = async (budgetId) => {
    // Add a confirmation step here in a real app
    try {
      await Budget.delete(budgetId);
      toast.success("Category deleted successfully");
      loadMonthData(); // Refresh budgets and dependent data
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };


  // Function to get spending for non-cashflow items
  const getNonCashflowAmount = (type) => {
    let relevantTransactions = allTransactionsForMonth.filter(t => t.is_non_cashflow);
    
    if (selectedAccountId !== "all") {
        relevantTransactions = relevantTransactions.filter(t => t.source_id === selectedAccountId);
    }

    // For income: positive amounts with non_cashflow_income category
    if (type === "income") {
      return relevantTransactions
        .filter(t => t.category === "non_cashflow_income" && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    } 
    
    // For expenses: negative amounts with non_cashflow_expense category
    return relevantTransactions
      .filter(t => t.category === "non_cashflow_expense" && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  // Get transactions for non-cashflow categories
  const getNonCashflowTransactions = (category) => {
    let relevantTransactions = allTransactionsForMonth.filter(t => t.is_non_cashflow && t.category === category);
    
    if (selectedAccountId !== "all") {
        relevantTransactions = relevantTransactions.filter(t => t.source_id === selectedAccountId);
    }
    
    return relevantTransactions;
  };


  const filteredTransactionsForSummary = useMemo(() => {
    let transactionsToConsider = allTransactionsForMonth.filter(t => !t.is_non_cashflow);
    
    if (selectedAccountId !== "all") {
      transactionsToConsider = transactionsToConsider.filter(t => t.source_id === selectedAccountId);
    }
    return transactionsToConsider;
  }, [allTransactionsForMonth, selectedAccountId]);


  const summary = useMemo(() => {
    let incomeTxns = filteredTransactionsForSummary.filter(t => t.amount > 0);
    if (selectedIncomeType !== "all") {
      incomeTxns = incomeTxns.filter(t => t.income_type === selectedIncomeType);
    }
    const income = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
      
    let expenseTxns = filteredTransactionsForSummary.filter(t => t.amount < 0);
    if (selectedExpenseType !== "all") {
      expenseTxns = expenseTxns.filter(t => t.expense_type === selectedExpenseType);
    }
    const expenses = expenseTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate breakdowns - regardless of selected filters
    // This ensures dropdown always shows correct subtotals
    const expectedIncome = filteredTransactionsForSummary
      .filter(t => t.amount > 0 && t.income_type === "expected")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const unexpectedIncome = filteredTransactionsForSummary
      .filter(t => t.amount > 0 && t.income_type === "unexpected")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const fixedExpenses = filteredTransactionsForSummary
      .filter(t => t.amount < 0 && t.expense_type === "expected")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const variableExpenses = filteredTransactionsForSummary
      .filter(t => t.amount < 0 && t.expense_type === "unexpected")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    setIncomeBreakdown({ expected: expectedIncome, unexpected: unexpectedIncome });
    setExpenseBreakdown({ fixed: fixedExpenses, variable: variableExpenses });
      
    return {
      income,
      expenses,
      balance: income - expenses,
      hasTransactions: filteredTransactionsForSummary.length > 0,
      incomeBreakdown: { expected: expectedIncome, unexpected: unexpectedIncome },
      expenseBreakdown: { fixed: fixedExpenses, variable: variableExpenses }
    };
  }, [filteredTransactionsForSummary, selectedIncomeType, selectedExpenseType]);
  
  useEffect(() => {
    if (!user || isLoading) return;

    const calculateWeeklyDataForSparkline = (transactions, type) => {
        if (!transactions || transactions.length === 0) return [0, 0, 0, 0];
        const weeklyTotals = [0, 0, 0, 0];
        const currentMonthNumber = parseISO(`${selectedMonth}-01`).getMonth();

        transactions.forEach(t => {
            if (t.date) {
                const transactionDate = parseISO(t.date);
                // Ensure transaction is in the currently selected month before processing for sparkline
                if (transactionDate.getMonth() === currentMonthNumber) {
                    const dayOfMonth = transactionDate.getDate();
                    // Simple week calculation (0-3 for 4 weeks)
                    const weekIndex = Math.min(3, Math.floor((dayOfMonth - 1) / 7.75)); // Adjusted for better distribution over ~4 weeks
                    if (type === 'income') {
                        weeklyTotals[weekIndex] += t.amount > 0 ? t.amount : 0;
                    } else if (type === 'expense') {
                        weeklyTotals[weekIndex] += t.amount < 0 ? Math.abs(t.amount) : 0;
                    }
                }
            }
        });
        return weeklyTotals;
    };
    
    // Filter for sparklines based on current selections (NCF already filtered in filteredTransactionsForSummary)
    const currentIncomeTransactions = filteredTransactionsForSummary.filter(t => t.amount > 0 && (selectedIncomeType === 'all' || t.income_type === selectedIncomeType));
    const currentExpenseTransactions = filteredTransactionsForSummary.filter(t => t.amount < 0 && (selectedExpenseType === 'all' || t.expense_type === selectedExpenseType));

    const incomeSpark = calculateWeeklyDataForSparkline(currentIncomeTransactions, 'income');
    const expenseSpark = calculateWeeklyDataForSparkline(currentExpenseTransactions, 'expense');
    
    setWeeklyIncomeData(incomeSpark);
    setWeeklyExpenseData(expenseSpark);
    setWeeklyNetData(incomeSpark.map((inc, i) => inc - expenseSpark[i]));

  }, [filteredTransactionsForSummary, selectedIncomeType, selectedExpenseType, selectedMonth, user, isLoading]);

  const handleMonthChange = async (month) => {
    setSelectedMonth(month);
    if (preferences) {
      try {
        await UserPreference.update(preferences.id, { selected_month: month });
      } catch (error) {
        console.warn("Could not save selected month preference", error);
      }
    }
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccountId(accountId);
  };
  
  const handleIncomeTypeChange = (incomeType) => {
    setSelectedIncomeType(incomeType);
  };

  const handleExpenseTypeChange = (expenseType) => { // New handler
    setSelectedExpenseType(expenseType);
  };

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const getSpendingByCategory = (category) => {
    // Filter out non-cashflow transactions and by selected account
    let relevantTransactions = allTransactionsForMonth.filter(t => !t.is_non_cashflow);
    if (selectedAccountId !== "all") {
        relevantTransactions = relevantTransactions.filter(t => t.source_id === selectedAccountId);
    }

    return relevantTransactions
      .filter(t => t.category === category && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const formatMonthDisplay = (monthString) => {
    if (!monthString) return "";
    const date = parseISO(`${monthString}-01`);
    return format(date, "MMMM yyyy");
  };

  const handleTransactionUpdated = async (updatedTransaction) => {
    try {
      // Reload all transaction data to ensure consistency
      await loadMonthData(); // This re-fetches budgets and transactions for the month
      if (toast && toast.success) { // Check if toast exists before calling
           toast.success("Transaction updated successfully");
      }
    } catch (error) {
      console.error("Error refreshing transactions after update:", error);
      if (toast && toast.error) {
          toast.error("Failed to refresh data after transaction update.");
      }
    }
    setEditingTransaction(null); // Close edit modal if open
    // No need to close income drawer here, it handles its own state
  };
  
  // New handler for flagging a transaction as non-cashflow from the drawer
  const handleFlagTransactionAsNonCashflow = async (transaction) => {
    if (!transaction) return;
    try {
      const newCategory = transaction.amount > 0 ? "non_cashflow_income" : "non_cashflow_expense";
      await Transaction.update(transaction.id, { 
        is_non_cashflow: true,
        category: newCategory, // Explicitly set category
        income_type: "not_applicable", // Reset income_type for NCF
        expense_type: "not_applicable" // Reset expense_type for NCF
      });
      toast.success(`Transaction flagged as ${newCategory.replace("_", " ")}`);
      await loadMonthData(); // Refresh data
    } catch (error) {
      console.error("Error flagging transaction as non-cashflow:", error);
      toast.error("Failed to flag transaction.");
    }
  };

  const sortedBudgets = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      spentAmount: getSpendingByCategory(budget.category) // Uses updated getSpendingByCategory
    })).sort((a, b) => b.spentAmount - a.spentAmount);
  }, [budgets, allTransactionsForMonth, selectedAccountId]);

  const selectedAccountName = useMemo(() => {
    if (selectedAccountId === "all") return "All Accounts";
    const account = transactionSources.find(s => s.id === selectedAccountId);
    return account ? account.name : "Selected Account";
  }, [selectedAccountId, transactionSources]);

  const showNoDataMessageForAccount = selectedAccountId !== "all" && !summary.hasTransactions && !isLoading;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sourceId = params.get('source');
    if (sourceId) {
      setSelectedAccountId(sourceId);
    }
  }, [window.location.search]);

  // Add this function to handle viewing category history
  const handleViewCategoryHistory = (category, icon, color) => {
    setSelectedHistoryCategory({
      name: category,
      icon: icon,
      color: color
    });
    setShowCategoryHistory(true);
  };

  const renderCategoryCard = (budget) => (
    <div key={budget.id} className="w-full md:max-w-xl mx-auto">
      <CategoryCard
        id={budget.id}
        category={budget.category}
        budgeted={budget.amount}
        spent={budget.spentAmount}
        color={budget.color}
        icon={budget.icon}
        currency={budget.currency || "AED"}
        month={selectedMonth}
        isExpanded={!!expandedCategories[budget.id]}
        onToggleExpand={() => handleCategoryToggle(budget.id)}
        onEditBudget={handleEditBudget}
        onDeleteCategory={handleDeleteCategory}
        onTransactionUpdated={handleTransactionUpdated}
        toastInstance={toast}
        transactionsForCategory={allTransactionsForMonth.filter(tx => 
          tx.category === budget.category && 
          tx.month === selectedMonth && 
          (selectedAccountId === 'all' || tx.source_id === selectedAccountId) &&
          !tx.is_non_cashflow
        )}
        onViewHistory={() => handleViewCategoryHistory(budget.category, budget.icon, budget.color)}
      />
    </div>
  );

  useEffect(() => {
    // ... inside loadMonthData or a separate effect that processes allTransactionsForMonth ...
    const incomeTxnsForDrawer = allTransactionsForMonth.filter(
      (t) => t.amount > 0 && !t.is_non_cashflow // Only cashflow income for this specific drawer
    );
    setIncomeTransactions(incomeTxnsForDrawer);
  }, [allTransactionsForMonth]);

  const handleEditGoal = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoal(goal);
      setShowAddGoalModal(true); // Re-use AddGoalModal for editing
    }
  };
  
  const handleAddOrRemoveFunds = (goal, remove = false) => {
    setActiveGoalForFunds(goal);
    setIsRemovingFunds(remove);
    setShowAddFundsModal(true);
  };

  const handleFundsSave = async (amount) => {
    if (!activeGoalForFunds) return;
    
    const newAmount = isRemovingFunds 
        ? Math.max(0, activeGoalForFunds.current_amount - amount) // Ensure not negative
        : activeGoalForFunds.current_amount + amount;

    try {
      await FinancialGoal.update(activeGoalForFunds.id, {
        current_amount: newAmount
      });
      toast.success(`Funds ${isRemovingFunds ? 'removed' : 'added'} successfully to ${activeGoalForFunds.name}`);
      loadInitialData(); // Refresh goals
      setShowAddFundsModal(false);
      setActiveGoalForFunds(null);
    } catch (error) {
      console.error(`Error ${isRemovingFunds ? 'removing' : 'adding'} funds:`, error);
      toast.error(`Failed to ${isRemovingFunds ? 'remove' : 'add'} funds.`);
    }
  };
  
  const handleDeleteGoal = async (goalId) => {
    try {
      await FinancialGoal.delete(goalId);
      toast.success("Goal deleted successfully");
      loadInitialData(); // Refresh goals
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal.");
    }
  };

  const handleMarkGoalCompleted = async (goalId) => {
    try {
      await FinancialGoal.update(goalId, { is_completed: true });
      toast.success("Goal marked as completed");
      loadInitialData(); // Refresh goals
    } catch (error) {
      console.error("Error marking goal as completed:", error);
      toast.error("Failed to mark goal as completed.");
    }
  };

  const handleReopenGoal = async (goalId) => {
    try {
      await FinancialGoal.update(goalId, { is_completed: false });
      toast.success("Goal reopened");
      loadInitialData(); // Refresh goals
    } catch (error) {
      console.error("Error reopening goal:", error);
      toast.error("Failed to reopen goal.");
    }
  };

  const toggleSectionExpand = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderGoalCard = (goal) => (
    <GoalCard
      key={goal.id}
      id={goal.id}
      name={goal.name}
      current={goal.current_amount}
      target={goal.target_amount}
      currency={goal.currency}
      color={goal.color}
      targetDate={goal.target_date}
      icon={goal.icon}
      onAddFunds={() => handleAddOrRemoveFunds(goal, false)}
      onRemoveFunds={() => handleAddOrRemoveFunds(goal, true)} // New prop
      onEditGoal={() => handleEditGoal(goal.id)}
      onDeleteGoal={() => handleDeleteGoal(goal.id)}
    />
  );

  // Render loading state or null while checking user context
  if (isLoadingUserContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary-end)]"></div>
      </div>
    );
  }

  // ... rest of the DashboardContent return JSX ...
  // Ensure this return is only reached if user is authenticated and onboarding is complete.
  
  return (
    <div className="min-h-screen bg-[var(--surface)] p-4 pb-20 overflow-x-hidden relative">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6 overflow-x-hidden relative">
        {/* Top Controls Section */}
        <div className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
            <div className="w-full sm:w-auto flex justify-center">
              <MonthSelector
                selectedMonth={selectedMonth}
                onPrevMonth={() => handleMonthChange(format(subMonths(parseISO(`${selectedMonth}-01`), 1), "yyyy-MM"))}
                onNextMonth={() => handleMonthChange(format(addMonths(parseISO(`${selectedMonth}-01`), 1), "yyyy-MM"))}
                monthDisplay={formatMonthDisplay(selectedMonth)}
              />
            </div>
            
            <div className="w-full sm:w-auto flex justify-center">
              <AccountFilterDropdown
                accounts={transactionSources}
                selectedAccountId={selectedAccountId}
                onAccountChange={handleAccountChange}
                isLoading={isLoading && transactionSources.length === 0}
              />
            </div>
            
            <div className="ml-auto hidden sm:flex gap-2">
              <Button variant="ghost" size="icon" className="glass-card !p-2 !rounded-lg hover:!shadow-md text-[var(--text-secondary)]">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="glass-card !p-2 !rounded-lg hover:!shadow-md text-[var(--text-secondary)]">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Currently Viewing Pill - Centered on mobile */}
          {selectedAccountId !== 'all' && (
            <div className="mb-4 flex justify-center sm:justify-start">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--primary-end)]/10 text-[var(--primary-end)]">
                Currently Viewing: {selectedAccountName}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="relative z-10 mb-6 w-full overflow-visible">
          <div className="w-full">
            <SummaryCard 
              summary={summary}
              isLoading={isLoading}
              month={formatMonthDisplay(selectedMonth)}
              selectedAccountName={selectedAccountName}
              noDataMessage={showNoDataMessageForAccount ? `No transactions found for ${selectedAccountName} this month.` : null}
              incomeTransactions={incomeTransactions} 
              onEditTransaction={(transaction) => {
                setEditingTransaction(transaction);
                setShowEditTransactionModal(true);
              }}
              onFlagNonCashflow={handleFlagTransactionAsNonCashflow}
              incomeBreakdown={incomeBreakdown}
              expenseBreakdown={expenseBreakdown}
            />
          </div>
        </div>

        {/* Category Budgets Section - Also centered on mobile */}
        <div className="relative z-0 mb-12">
          <div className="flex justify-between items-center mb-4 sticky top-[calc(theme(spacing.16)_-_theme(spacing.4))] md:top-0 bg-[var(--surface)] py-2 px-4 sm:px-0">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">
              Category Budgets {selectedAccountId !== "all" ? `(for ${selectedAccountName})` : ""}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => ( <div key={i} className="w-full md:max-w-xl mx-auto"><SkeletonLoader type="category" /></div> ))}
            </div>
          ) : showNoDataMessageForAccount ? (
             <Alert className="glass-card !bg-blue-500/10 !border-blue-500/30 text-blue-700 p-4 rounded-lg md:max-w-xl mx-auto">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <AlertDescription>
                No spending data for {selectedAccountName} in {formatMonthDisplay(selectedMonth)}. Budgets are still active for other accounts.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Regular Category Budget Cards */}
              {sortedBudgets.map(budget => renderCategoryCard(budget))}
              
              {/* "Add Category" button */}
              <div className="w-full md:max-w-xl mx-auto">
                <button onClick={handleAddCategory} className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-[var(--primary-end)] font-medium hover:border-[var(--primary-end)] hover:bg-blue-50 transition-all">
                  <Plus className="w-5 h-5" /> Add Category
                </button>
              </div>

              {/* Permanent Non-Cashflow Cards */}
              {!isLoading && (
                <>
                  {/* Non-Cashflow Income Card */}
                  <div className="w-full md:max-w-xl mx-auto">
                    <CategoryCard
                      id="non-cashflow-income"
                      category="non_cashflow_income"
                      budgeted={0}
                      spent={getNonCashflowAmount("income")}
                      color="#6c757d"
                      icon="bar-chart-horizontal-big"
                      currency="AED"
                      month={selectedMonth}
                      isExpanded={!!expandedCategories["non-cashflow-income"]}
                      onToggleExpand={() => handleCategoryToggle("non-cashflow-income")}
                      onEditBudget={() => {}} 
                      onDeleteCategory={() => {}}
                      onTransactionUpdated={handleTransactionUpdated}
                      toastInstance={toast}
                      transactionsForCategory={getNonCashflowTransactions("non_cashflow_income")}
                      isNonCashflow={true}
                    />
                  </div>
                  
                  {/* Non-Cashflow Expense Card */}
                  <div className="w-full md:max-w-xl mx-auto">
                    <CategoryCard
                      id="non-cashflow-expense"
                      category="non_cashflow_expense"
                      budgeted={0}
                      spent={getNonCashflowAmount("expense")}
                      color="#6c757d"
                      icon="bar-chart-horizontal-big"
                      currency="AED"
                      month={selectedMonth}
                      isExpanded={!!expandedCategories["non-cashflow-expense"]}
                      onToggleExpand={() => handleCategoryToggle("non-cashflow-expense")}
                      onEditBudget={() => {}}
                      onDeleteCategory={() => {}}
                      onTransactionUpdated={handleTransactionUpdated}
                      toastInstance={toast}
                      transactionsForCategory={getNonCashflowTransactions("non_cashflow_expense")}
                      isNonCashflow={true}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Financial Goals Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">Financial Goals</h2>
          </div>

          {isLoading ? (
             <div className="w-full md:max-w-xl mx-auto space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-full">
                   <SkeletonLoader type="goal" />
                 </div>
               ))}
             </div>
          ) : (
            <div className="space-y-4">
              {/* Active Goals */}
              {goals.filter(goal => !goal.is_completed).length === 0 && !isLoading ? (
                <div className="w-full md:max-w-xl mx-auto text-center p-8 glass-card bg-white/50"> 
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-[var(--primary-end)]/10 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-[var(--primary-end)]" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">No Active Goals</h3>
                  <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                    Set financial goals to track your progress and stay motivated on your saving journey.
                  </p>
                </div>
              ) : (
                goals.filter(goal => !goal.is_completed).map(goal => (
                  <div key={goal.id} className="w-full md:max-w-xl mx-auto">
                    <GoalCard
                      id={goal.id}
                      name={goal.name}
                      current={goal.current_amount}
                      target={goal.target_amount}
                      currency={goal.currency}
                      color={goal.color}
                      targetDate={goal.target_date}
                      icon={goal.icon}
                      isCompleted={false}
                      onAddFunds={() => handleAddOrRemoveFunds(goal, false)}
                      onRemoveFunds={() => handleAddOrRemoveFunds(goal, true)} 
                      onEditGoal={() => handleEditGoal(goal.id)}
                      onDeleteGoal={() => handleDeleteGoal(goal.id)}
                      onMarkCompleted={handleMarkGoalCompleted}
                      onReopenGoal={handleReopenGoal}
                    />
                  </div>
                ))
              )}
              
              {/* Add New Goal Button */}
              <div className="w-full md:max-w-xl mx-auto">
                <button 
                  onClick={() => { setEditingGoal(null); setShowAddGoalModal(true); }} 
                  className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-[var(--primary-end)] font-medium hover:border-[var(--primary-end)] hover:bg-blue-50 transition-all"
                >
                  <Plus className="w-5 h-5" /> Add New Goal
                </button>
              </div>
              
              {/* Completed Goals Section */}
              {goals.filter(goal => goal.is_completed).length > 0 && (
                <div className="w-full md:max-w-xl mx-auto mt-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg mb-2"
                    onClick={() => toggleSectionExpand('completedGoals')}
                  >
                    <h3 className="text-md font-medium text-gray-700">Completed Goals</h3>
                    <Button variant="ghost" size="sm" className="p-1 h-auto">
                      {expandedSections.completedGoals ? 
                        <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      }
                    </Button>
                  </div>
                  
                  {expandedSections.completedGoals && (
                    <div className="space-y-4 mt-4">
                      {goals.filter(goal => goal.is_completed).map(goal => (
                        <div key={goal.id} className="w-full">
                          <GoalCard
                            id={goal.id}
                            name={goal.name}
                            current={goal.current_amount}
                            target={goal.target_amount}
                            currency={goal.currency}
                            color={goal.color}
                            targetDate={goal.target_date}
                            icon={goal.icon}
                            isCompleted={true}
                            onEditGoal={() => handleEditGoal(goal.id)}
                            onDeleteGoal={() => handleDeleteGoal(goal.id)}
                            onReopenGoal={handleReopenGoal}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* View All Transactions button */}
        <div className="text-center">
          <Link to={createPageUrl(`Transactions?month=${selectedMonth}${selectedAccountId !== 'all' ? `&source_id=${selectedAccountId}` : ''}`)}>
            <Button variant="outline" className="glass-card !border-white/30 text-[var(--text-primary)] rounded-xl px-6 py-3 hover:!shadow-md">
              View {selectedAccountId !== 'all' ? `${selectedAccountName}` : 'All'} Transactions
            </Button>
          </Link>
        </div>
        
        <EditBudgetModal 
          isOpen={showEditBudgetModal} 
          onClose={() => { setShowEditBudgetModal(false); setEditingBudget(null); }}
          budget={editingBudget}
          onSave={async (budgetData) => {
            try {
              if (budgetData.id) {
                await Budget.update(budgetData.id, {
                  amount: budgetData.amount,
                  category: budgetData.category,
                  icon: budgetData.icon,
                  color: budgetData.color
                });
                toast.success("Budget updated successfully");
              } else {
                await Budget.create({
                  category: budgetData.category,
                  amount: budgetData.amount,
                  month: selectedMonth,
                  currency: budgetData.currency || "AED",
                  icon: budgetData.icon || "shopping-bag",
                  color: budgetData.color || "#00C6FF"
                });
                toast.success("New category added successfully");
              }
              loadMonthData();
              setShowEditBudgetModal(false);
              setEditingBudget(null);
            } catch (error) {
              console.error("Error saving budget:", error);
              toast.error("Failed to save budget changes.");
            }
          }}
        />
        
        {showEditTransactionModal && editingTransaction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <EditTransactionCategoryModal
              transaction={editingTransaction}
              isOpen={showEditTransactionModal}
              onClose={() => {
                setShowEditTransactionModal(false);
                setEditingTransaction(null);
              }}
              onSuccess={handleTransactionUpdated}
            />
          </div>
        )}
        
        {/* Goal Modals and Drawers */}
        <AddGoalModal
          isOpen={showAddGoalModal}
          onClose={() => { setShowAddGoalModal(false); setEditingGoal(null); }}
          goal={editingGoal} // Pass editingGoal here
          onSave={async (goalData) => {
            try {
              if (editingGoal) { // Check if editing
                await FinancialGoal.update(editingGoal.id, goalData);
                toast.success("Goal updated successfully!");
              } else {
                await FinancialGoal.create(goalData);
                toast.success("Goal created successfully!");
              }
              loadInitialData(); // Refresh goals
              setShowAddGoalModal(false);
              setEditingGoal(null);
            } catch (error) {
              console.error("Error saving goal:", error);
              toast.error("Failed to save goal.");
            }
          }}
        />
        
        {showAddFundsModal && activeGoalForFunds && (
          <AddFundsModal
            isOpen={showAddFundsModal}
            onClose={() => {
              setShowAddFundsModal(false);
              setActiveGoalForFunds(null);
              setIsRemovingFunds(false);
            }}
            onSave={handleFundsSave}
            goalName={activeGoalForFunds.name}
            goalCurrency={activeGoalForFunds.currency || "AED"}
            isRemoving={isRemovingFunds} // Pass this to AddFundsModal
          />
        )}
        
        {/* GoalHistoryDrawer is kept if needed elsewhere, but not triggered from GoalCard anymore */}
        <GoalHistoryDrawer
          isOpen={showGoalHistoryDrawer}
          onClose={() => {
            setShowGoalHistoryDrawer(false);
            setSelectedGoalForHistory(null);
          }}
          goalId={selectedGoalForHistory?.id}
          goalName={selectedGoalForHistory?.name}
        />
        
        <CategoryHistoryDrawer
          isOpen={showCategoryHistory}
          onClose={() => setShowCategoryHistory(false)}
          category={selectedHistoryCategory?.name}
          categoryIcon={selectedHistoryCategory?.icon}
          categoryColor={selectedHistoryCategory?.color}
        />
      </div>
    </div>
  );
}

// Single default export that wraps DashboardContent with ToastProvider
export default function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
