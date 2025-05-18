
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Transaction } from "@/api/entities";
import { BarChartHorizontalBig, AlertTriangle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { cn } from "@/lib/utils";

export default function AddExpenseForm({ onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    amount: "",
    category: "other", // Default to 'other' for expenses
    description: "",
    notes: "",
    income_type: "not_applicable" // New field
  });
  const [isIncome, setIsIncome] = useState(false); // To toggle income_type field

  const categories = [
    { value: "income", label: "Income" },
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
    { value: "savings", label: "Savings" },
    { value: "other", label: "Other" },
    { value: "non_cashflow_income", label: "Non-Cashflow Income", icon: BarChartHorizontalBig },
    { value: "non_cashflow_expense", label: "Non-Cashflow Expense", icon: BarChartHorizontalBig }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // More advanced handling for category changes
    if (field === "category") {
      const isNonCashflow = value === "non_cashflow_income" || value === "non_cashflow_expense";
      setFormData(prev => ({
        ...prev,
        is_non_cashflow: isNonCashflow,
        income_type: isNonCashflow ? "not_applicable" : prev.income_type
      }));
      
      if (value === "income") {
        setIsIncome(true);
        setFormData(prev => ({
          ...prev, 
          income_type: prev.income_type === "not_applicable" ? "expected" : prev.income_type
        }));
      } else if (value !== "income" && value !== "non_cashflow_income") {
        setIsIncome(false);
        setFormData(prev => ({ ...prev, income_type: "not_applicable" }));
      }
    }
    
    // Handle amount changes
    if (field === "amount") {
      const numericAmount = parseFloat(value);
      setIsIncome(numericAmount > 0);
      
      if (numericAmount > 0) {
        setFormData(prev => ({
          ...prev,
          category: prev.category === "non_cashflow_income" ? prev.category : "income",
          income_type: prev.income_type === "not_applicable" ? "expected" : prev.income_type
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          category: prev.category === "income" ? "other" : prev.category,
          income_type: "not_applicable"
        }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    setIsSubmitting(true);
    
    try {
      // Amount is taken as is. If it's an expense, user should enter negative or it's handled by category selection.
      const amount = parseFloat(formData.amount);
      
      let payload = {
        source_id: "manual", // This is just a placeholder - will be assigned server-side
        date: formData.date.toISOString().slice(0, 10),
        amount,
        description: formData.description,
        category: formData.category,
        month: formData.date.toISOString().slice(0, 7),
        currency: "AED" // Add currency to match schema expectations
      };
      
      // Add optional fields only if they have values
      if (formData.notes) {
        payload.subcategory = formData.notes;
      }
      
      if (formData.category === "income") {
        payload.income_type = formData.income_type;
      }
      
      if (formData.category === "non_cashflow_income" || formData.category === "non_cashflow_expense") {
        payload.is_non_cashflow = true;
      }

      const transaction = await Transaction.create(payload);
      
      onSuccess(transaction);
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert(`Error adding transaction: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const incomeTypes = [
      { value: "expected", label: "Expected" },
      { value: "unexpected", label: "Unexpected" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", damping: 25 }}
      className="p-6 max-w-md w-full mx-auto bg-[var(--surface)] rounded-2xl shadow-xl border border-white/20"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Expense</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-[var(--text-secondary)] hover:bg-white/10 rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[var(--text-secondary)] text-sm">Amount (AED)</Label>
            <Input
              id="amount" type="number" step="0.01" placeholder="0.00 or -0.00"
              value={formData.amount} onChange={(e) => handleChange("amount", e.target.value)}
              className="text-lg bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[var(--text-secondary)] text-sm">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 hover:bg-white/70 text-[var(--text-primary)]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card border-none shadow-2xl z-[150]">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => handleChange("date", date)}
                  initialFocus
                  className="bg-transparent"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category" className="text-[var(--text-secondary)] text-sm">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger id="category" className="bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="glass-card border-none shadow-2xl z-[150]">
              {categories.map(category => (
                <SelectItem 
                  key={category.value} 
                  value={category.value} 
                  className={cn(
                    "hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40",
                    category.value.includes('non_cashflow') && "border-t border-gray-200 mt-2 pt-2"
                  )}
                >
                  <div className="flex items-center">
                    {category.icon && <category.icon className="w-4 h-4 mr-2 text-gray-500" />}
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.category.includes('non_cashflow') && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Non-cashflow transactions won't be counted in your budget summaries or cash flow calculations.
            </AlertDescription>
          </Alert>
        )}
        
        {isIncome && formData.category === "income" && (
          <div className="space-y-2">
            <Label htmlFor="income_type" className="text-[var(--text-secondary)] text-sm">Income Type</Label>
            <Select value={formData.income_type} onValueChange={(value) => handleChange("income_type", value)}>
              <SelectTrigger id="income_type" className="bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]">
                <SelectValue placeholder="Select income type" />
              </SelectTrigger>
              <SelectContent className="glass-card border-none shadow-2xl z-[150]">
                {incomeTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40 text-[var(--text-primary)]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-[var(--text-secondary)] text-sm">Description</Label>
          <Input
            id="description"
            placeholder="E.g., Grocery shopping at Carrefour"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-[var(--text-secondary)] text-sm">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional details..."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 hover:bg-white/70 text-[var(--text-secondary)]"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 btn-gradient btn-gradient-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
