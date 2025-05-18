import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { motion } from "framer-motion";

export default function AddGoalModal({ isOpen, onClose, onSave, goal }) {
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    currency: "AED",
    target_date: "",
    icon: "savings", // Default icon
    color: "#006D77" // Default color
  });

  useEffect(() => {
    if (goal) {
      // If editing an existing goal, prefill the form
      setFormData({
        name: goal.name || "",
        target_amount: goal.target_amount?.toString() || "",
        current_amount: goal.current_amount?.toString() || "0",
        currency: goal.currency || "AED",
        target_date: goal.target_date || "",
        icon: goal.icon || "savings",
        color: goal.color || "#006D77"
      });
    } else {
      // Default form for new goal
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      
      setFormData({
        name: "",
        target_amount: "",
        current_amount: "0",
        currency: "AED",
        target_date: sixMonthsLater.toISOString().slice(0, 10),
        icon: "savings",
        color: "#006D77"
      });
    }
  }, [goal, isOpen]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string amounts to numbers
    const processedData = {
      ...formData,
      target_amount: parseFloat(formData.target_amount) || 0,
      current_amount: parseFloat(formData.current_amount) || 0
    };
    
    onSave(processedData);
  };

  if (!isOpen) return null;

  const iconOptions = [
    { value: "savings", label: "Savings" },
    { value: "target", label: "Target" },
    { value: "travel", label: "Travel" },
    { value: "house", label: "House" },
    { value: "car", label: "Car" },
    { value: "gift", label: "Gift" },
    { value: "education", label: "Education" }
  ];

  const colorOptions = [
    { value: "#006D77", label: "Teal" },
    { value: "#4361EE", label: "Royal Blue" },
    { value: "#9D4EDD", label: "Purple" },
    { value: "#E63946", label: "Red" },
    { value: "#FF9F1C", label: "Orange" },
    { value: "#2A9D8F", label: "Green" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Emergency Fund"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Target Amount</Label>
              <div className="relative mt-1">
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange('target_amount', e.target.value)}
                  placeholder="50000"
                  required
                  min="0"
                  step="any"
                  className="pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.currency}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="current_amount">Starting Amount</Label>
              <div className="relative mt-1">
                <Input
                  id="current_amount"
                  type="number"
                  value={formData.current_amount}
                  onChange={(e) => handleInputChange('current_amount', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="any"
                  className="pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.currency}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AED">AED</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date ? format(new Date(formData.target_date), "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.target_date ? new Date(formData.target_date) : undefined}
                  onSelect={(date) => handleInputChange('target_date', date ? date.toISOString().slice(0, 10) : '')}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select 
                value={formData.icon} 
                onValueChange={(value) => handleInputChange('icon', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => handleInputChange('color', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: option.value }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 btn-gradient btn-gradient-primary"
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}