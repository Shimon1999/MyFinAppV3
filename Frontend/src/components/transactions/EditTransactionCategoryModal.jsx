import React, { useState, useEffect } from "react";
import { BarChartHorizontalBig, AlertTriangle, ShoppingBag, Utensils, Car, ShoppingCart, Film, Zap, Home, Activity, BookOpen, MapPin, PiggyBank, MoreHorizontal, TrendingUp, X, Wallet, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Transaction } from "@/api/entities"; 
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Ensure all category icons are mapped, including non-cashflow
const categoryIconsAndColors = {
    income: { icon: TrendingUp, color: "var(--success)", bgColor: "bg-green-100", textColor: "text-green-700", label: "Income" },
    groceries: { icon: ShoppingBag, color: "#83C5BE", bgColor: "bg-teal-100", textColor: "text-teal-600", label: "Groceries" },
    dining: { icon: Utensils, color: "#FF6B6B", bgColor: "bg-red-100", textColor: "text-red-600", label: "Dining" },
    transport: { icon: Car, color: "#FFD166", bgColor: "bg-yellow-100", textColor: "text-yellow-600", label: "Transport" },
    shopping: { icon: ShoppingCart, color: "#06D6A0", bgColor: "bg-green-100", textColor: "text-green-600", label: "Shopping" },
    entertainment: { icon: Film, color: "#118AB2", bgColor: "bg-cyan-100", textColor: "text-cyan-600", label: "Entertainment" },
    utilities: { icon: Zap, color: "#073B4C", bgColor: "bg-slate-100", textColor: "text-slate-600", label: "Utilities" },
    housing: { icon: Home, color: "#8338EC", bgColor: "bg-purple-100", textColor: "text-purple-600", label: "Housing" },
    healthcare: { icon: Activity, color: "#34D399", bgColor: "bg-emerald-100", textColor: "text-emerald-600", label: "Healthcare" },
    education: { icon: BookOpen, color: "#38BDF8", bgColor: "bg-sky-100", textColor: "text-sky-600", label: "Education" },
    travel: { icon: MapPin, color: "#F472B6", bgColor: "bg-rose-100", textColor: "text-rose-600", label: "Travel" },
    savings: { icon: PiggyBank, color: "#FBBF24", bgColor: "bg-amber-100", textColor: "text-amber-600", label: "Savings" },
    other: { icon: MoreHorizontal, color: "#6B7280", bgColor: "bg-gray-100", textColor: "text-gray-600", label: "Other" },
    non_cashflow_income: { icon: BarChartHorizontalBig, color: "#6B7280", bgColor: "bg-gray-100", textColor: "text-gray-700", label: "Non-Cashflow Income" },
    non_cashflow_expense: { icon: BarChartHorizontalBig, color: "#6B7280", bgColor: "bg-gray-100", textColor: "text-gray-700", label: "Non-Cashflow Expense" },
};

export default function EditTransactionCategoryModal({ transaction, isOpen, onClose, onSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(''); // This will be the primary category
  const [selectedIncomeType, setSelectedIncomeType] = useState(''); // For 'expected' or 'unexpected' when category is 'income'
  const [showWarning, setShowWarning] = useState(false);
  
  const expenseCategoryOptions = [
    // Filtered list of expense categories + NCF Expense
    { value: "groceries", label: "Groceries", icon: ShoppingBag },
    { value: "dining", label: "Dining", icon: Utensils },
    { value: "transport", label: "Transport", icon: Car },
    { value: "shopping", label: "Shopping", icon: ShoppingCart },
    { value: "entertainment", label: "Entertainment", icon: Film },
    { value: "utilities", label: "Utilities", icon: Zap },
    { value: "housing", label: "Housing", icon: Home },
    { value: "healthcare", label: "Healthcare", icon: Activity },
    { value: "education", label: "Education", icon: BookOpen },
    { value: "travel", label: "Travel", icon: MapPin },
    { value: "savings", label: "Savings", icon: PiggyBank }, // Savings is often treated as an expense/transfer
    { value: "other", label: "Other", icon: MoreHorizontal },
    { 
      value: "non_cashflow_expense", 
      label: "Non-Cashflow Expense", 
      icon: BarChartHorizontalBig,
      isNonCashflow: true 
    }
  ];

  // Options specifically for when transaction.amount > 0
  const incomeAssignmentOptions = [
    { type: "recurring_salary", label: "Recurring Salary", icon: Wallet, category: "income", income_type: "expected", is_non_cashflow: false },
    { type: "one_off_bonus", label: "One-Off Bonuses/Gifts", icon: Gift, category: "income", income_type: "unexpected", is_non_cashflow: false },
    { type: "non_cashflow_income", label: "Non-Cashflow Income", icon: BarChartHorizontalBig, category: "non_cashflow_income", income_type: "not_applicable", is_non_cashflow: true }
  ];
  
  useEffect(() => {
    if (transaction && isOpen) {
      setSelectedCategory(transaction.category);
      if (transaction.category === 'income') {
        setSelectedIncomeType(transaction.income_type);
      } else {
        setSelectedIncomeType(''); // Reset if not 'income' category
      }
      setShowWarning(transaction.is_non_cashflow || transaction.category === "non_cashflow_income" || transaction.category === "non_cashflow_expense");
    }
  }, [transaction, isOpen]);


  const handleSave = async () => {
    if (!transaction) return;
    
    let finalCategory = selectedCategory;
    let finalIncomeType = "not_applicable";
    let finalIsNonCashflow = false;
    let finalAmount = transaction.amount; // Preserve original sign unless changed

    if (transaction.amount > 0) { // Handling based on income assignment options
        const chosenIncomeOption = incomeAssignmentOptions.find(opt => opt.type === selectedIncomeType); // selectedIncomeType now stores 'recurring_salary', etc.
        if (chosenIncomeOption) {
            finalCategory = chosenIncomeOption.category;
            finalIncomeType = chosenIncomeOption.income_type;
            finalIsNonCashflow = chosenIncomeOption.is_non_cashflow;
        } else { // Fallback if somehow no income option was chosen but it's income
            finalCategory = "income"; // Default to generic income
            finalIncomeType = "unexpected"; // Default
        }
    } else { // Handling based on expense category selection
        const chosenExpenseOption = expenseCategoryOptions.find(opt => opt.value === selectedCategory);
        if (chosenExpenseOption) {
            finalIsNonCashflow = !!chosenExpenseOption.isNonCashflow;
        }
    }
    
    // Ensure amount is positive for income categories, negative for expense
    if ((finalCategory === "income" || finalCategory === "non_cashflow_income") && finalAmount < 0) {
        finalAmount = Math.abs(finalAmount);
    } else if (finalCategory !== "income" && finalCategory !== "non_cashflow_income" && finalAmount > 0) {
        finalAmount = -Math.abs(finalAmount);
    }


    setIsSaving(true);
    try {
      let updatePayload = { 
        category: finalCategory, 
        income_type: finalIncomeType,
        is_non_cashflow: finalIsNonCashflow,
        amount: finalAmount
      };
      
      // If it's a regular cashflow expense, ensure income_type is 'not_applicable'
      if (!finalIsNonCashflow && finalCategory !== "income") {
          updatePayload.income_type = "not_applicable";
      }

      const updatedTransaction = await Transaction.update(transaction.id, updatePayload);
      onSuccess(updatedTransaction);
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // This handles selection from the expense category grid
  const handleExpenseCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setShowWarning(categoryValue === "non_cashflow_expense");
  };
  
  // This handles selection from the 3 income assignment buttons
  const handleIncomeAssignmentSelect = (incomeOptionType) => {
      setSelectedIncomeType(incomeOptionType); // Store 'recurring_salary', 'one_off_bonus', or 'non_cashflow_income'
      const chosenOption = incomeAssignmentOptions.find(opt => opt.type === incomeOptionType);
      if (chosenOption) {
          setSelectedCategory(chosenOption.category); // Update primary category based on this selection
          setShowWarning(chosenOption.is_non_cashflow);
      }
  };


  if (!isOpen || !transaction) return null;

  const isCurrentlyIncome = transaction.amount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-visible" // Changed overflow to visible
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Change Category</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {showWarning && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Non-cashflow transactions won't be counted in your budget summaries or cash flow calculations.
            </AlertDescription>
          </Alert>
        )}

        {isCurrentlyIncome ? (
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Assign Income Type:</p>
            {incomeAssignmentOptions.map((option) => (
              <Button
                key={option.type}
                variant="outline"
                className={cn(
                  "w-full flex items-center justify-start p-3 h-auto",
                  selectedIncomeType === option.type
                    ? "bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white border-transparent"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => handleIncomeAssignmentSelect(option.type)}
              >
                <option.icon className={cn(
                  "w-5 h-5 mr-3",
                  selectedIncomeType === option.type ? "text-white" : "text-gray-500"
                )} />
                {option.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="grid gap-2 mb-6">
            {expenseCategoryOptions.map((category, index) => (
              <React.Fragment key={category.value}>
                {index > 0 && category.isNonCashflow && index === expenseCategoryOptions.length - 1 && (
                  <div className="border-t border-gray-200 my-2" />
                )}
                <Button
                  variant="outline"
                  className={cn(
                    "w-full flex items-center justify-start p-3 h-auto",
                    selectedCategory === category.value
                      ? "bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white border-transparent"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100",
                    category.isNonCashflow && "text-gray-600"
                  )}
                  onClick={() => handleExpenseCategorySelect(category.value)}
                >
                  <category.icon className={cn(
                    "w-5 h-5 mr-3",
                    selectedCategory === category.value ? "text-white" : "text-gray-500"
                  )} />
                  {category.label}
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
            disabled={isSaving || (!isCurrentlyIncome && !selectedCategory) || (isCurrentlyIncome && !selectedIncomeType)}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}