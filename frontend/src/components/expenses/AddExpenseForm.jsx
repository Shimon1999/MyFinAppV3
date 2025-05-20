import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { Transaction } from "@/api/entities";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AddExpenseForm({ onClose, onSuccess }) {
  const [transactionType, setTransactionType] = useState("expense"); // "expense" or "income"
  const [formData, setFormData] = useState({
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "",
    description: "",
    notes: "",
    income_type: "expected", // Default for income
  });

  const expenseCategories = [
    { value: "groceries", label: "Groceries" },
    { value: "dining", label: "Dining" },
    { value: "transport", label: "Transport" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" },
    { value: "utilities", label: "Utilities" },
    { value: "housing", label: "Housing" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel" },
    { value: "other", label: "Other" }
  ];

  const incomeTypes = [
    { value: "expected", label: "Expected Income (Salary, Regular)" },
    { value: "unexpected", label: "Unexpected Income (Bonus, Gift)" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let transactionAmount = parseFloat(formData.amount);
      if (isNaN(transactionAmount) || transactionAmount <= 0) {
        alert("Please enter a valid positive amount.");
        return;
      }
      
      if (transactionType === "expense") {
        transactionAmount = -transactionAmount;
      }
      
      if (transactionType === "expense" && !formData.category) {
        alert("Please select an expense category.");
        return;
      }
      
      await Transaction.create({
        amount: transactionAmount,
        date: formData.date,
        description: formData.description,
        category: transactionType === "income" ? "income" : formData.category,
        month: formData.date.substring(0, 7),
        expense_type: transactionType === "expense" ? (formData.category === "other" ? "unexpected" : "expected") : "not_applicable",
        income_type: transactionType === "income" ? formData.income_type : "not_applicable",
        source_id: "manual" 
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    setFormData(prev => ({ 
      ...prev, 
      category: "", 
      income_type: type === "income" ? "expected" : prev.income_type 
    }));
  };

  const selectedCategoryLabel = formData.category && transactionType === "expense"
    ? expenseCategories.find(cat => cat.value === formData.category)?.label 
    : null;
    
  const selectedIncomeTypeLabel = formData.income_type && transactionType === "income"
    ? incomeTypes.find(type => type.value === formData.income_type)?.label
    : null;

  return (
    // Ensure the modal itself can handle height constraints and scrolling if needed
    <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] sm:max-h-[80vh]">
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Add Transaction
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form content area made scrollable */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-grow overflow-y-auto scrollbar-thin">
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
            <Button
              type="button"
              onClick={() => handleTransactionTypeChange("expense")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 transition-all duration-200",
                transactionType === "expense"
                  ? "bg-white text-[var(--primary-end)] shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-200"
              )}
            >
              <ArrowDown className={cn("h-4 w-4", transactionType === "expense" ? "text-red-500" : "text-gray-400")} />
              Expense
            </Button>
            <Button
              type="button"
              onClick={() => handleTransactionTypeChange("income")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 transition-all duration-200",
                transactionType === "income"
                  ? "bg-white text-[var(--primary-end)] shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-200"
              )}
            >
              <ArrowUp className={cn("h-4 w-4", transactionType === "income" ? "text-green-500" : "text-gray-400")} />
              Income
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (AED)
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              required
              step="0.01"
              min="0.01" // Ensure positive amount is entered
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a positive amount. It will be stored appropriately based on type.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
              className="text-base"
            />
          </div>

          {transactionType === "expense" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required={transactionType === "expense"}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select an expense category">
                    {selectedCategoryLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(category => (
                    <SelectItem key={category.value} value={category.value} className="text-base">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {transactionType === "income" && (
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Income Type
              </label>
              <Select
                value={formData.income_type}
                onValueChange={(value) => handleInputChange("income_type", value)}
                required={transactionType === "income"}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select an income type">
                    {selectedIncomeTypeLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {incomeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-base">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="E.g., Groceries, Dinner with friends"
              required
              className="text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="text-base"
            />
          </div>
        </div>
      </form>
      
      {/* Footer with action buttons - remains fixed */}
      <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 py-2.5 text-base"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit" 
            form="add-transaction-form" // Link to the form ID (needs to be added to form tag)
            className="flex-1 py-2.5 text-base bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
            onClick={handleSubmit} // Directly call handleSubmit here because the button is outside the form now.
          >
            {transactionType === "expense" ? "Add Expense" : "Add Income"}
          </Button>
        </div>
      </div>
    </div>
  );
}