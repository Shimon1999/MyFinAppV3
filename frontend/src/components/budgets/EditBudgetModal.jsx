import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ShoppingBag, Utensils, Car, ShoppingCart, Film, Zap, Home, Activity, 
  BookOpen, MapPin, MoreHorizontal, PiggyBank } from "lucide-react";

const iconOptions = [
  { value: "shopping-bag", label: "Groceries", icon: ShoppingBag },
  { value: "utensils", label: "Dining", icon: Utensils },
  { value: "car", label: "Transport", icon: Car },
  { value: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { value: "film", label: "Entertainment", icon: Film },
  { value: "zap", label: "Utilities", icon: Zap },
  { value: "home", label: "Housing", icon: Home },
  { value: "activity", label: "Healthcare", icon: Activity },
  { value: "book-open", label: "Education", icon: BookOpen },
  { value: "map", label: "Travel", icon: MapPin },
  { value: "piggy-bank", label: "Savings", icon: PiggyBank },
  { value: "more-horizontal", label: "Other", icon: MoreHorizontal }
];

const categoryOptions = [
  "groceries",
  "dining",
  "transport",
  "shopping",
  "entertainment",
  "utilities",
  "housing",
  "healthcare",
  "education",
  "travel",
  "savings",
  "other"
];

export default function EditBudgetModal({ isOpen, onClose, budget, onSave }) {
  const [formData, setFormData] = useState({
    id: null,
    category: "",
    amount: 0,
    currency: "AED",
    icon: "shopping-bag"
  });
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        id: budget.id || null,
        category: budget.category || "",
        amount: budget.amount || 0,
        currency: budget.currency || "AED",
        icon: budget.icon || "shopping-bag"
      });
      
      // Check if it's a custom category
      setIsCustomCategory(!categoryOptions.includes(budget.category));
    }
  }, [budget]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear any errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSelectIcon = (icon) => {
    handleChange("icon", icon);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.category.trim()) {
      newErrors.category = "Category name is required";
    }
    
    if (formData.amount < 0) {
      newErrors.amount = "Budget amount cannot be negative";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving budget:", error);
      setErrors({ submit: "Failed to save changes. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {budget?.id ? "Edit Budget" : "Add Category"}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category Name</Label>
            {isCustomCategory || !budget?.id ? (
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="e.g., Groceries, Entertainment"
                className={errors.category ? "border-red-500" : ""}
              />
            ) : (
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomCategory(true);
                    handleChange("category", "");
                  } else {
                    handleChange("category", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom category...</SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Budget Amount</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                {formData.currency}
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                className={`rounded-l-none ${errors.amount ? "border-red-500" : ""}`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Category Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectIcon(option.value)}
                    className={`w-full aspect-square rounded-md flex items-center justify-center ${
                      formData.icon === option.value 
                        ? "bg-blue-100 text-blue-600 border-2 border-blue-500" 
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
          
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {errors.submit}
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : budget?.id ? "Save Changes" : "Add Category"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}