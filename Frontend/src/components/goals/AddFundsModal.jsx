import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, PlusCircle, MinusCircle } from "lucide-react"; // Added MinusCircle

export default function AddFundsModal({ isOpen, onClose, onSave, goalName, goalCurrency = "AED", isRemoving = false }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }
    
    onSave(parsedAmount);
    setAmount("");
    setError("");
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isRemoving ? "Remove funds from" : "Add funds to"} {goalName}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                {goalCurrency}
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="100.00"
                step="0.01"
                min="0"
                className="rounded-l-none"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className={`text-white ${isRemoving ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]'}`}
            >
              {isRemoving ? (
                <MinusCircle className="w-4 h-4 mr-1.5" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-1.5" />
              )}
              {isRemoving ? "Remove Funds" : "Add Funds"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}