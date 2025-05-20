import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { Transaction } from '@/api/entities';

export default function CategoryTransactionItem({ transaction, onUpdated, currency = "AED" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const categories = [
    "groceries", "dining", "transport", "shopping", "entertainment", 
    "utilities", "housing", "healthcare", "education", "travel", 
    "savings", "other"
  ];
  
  const formatName = (name) => {
    if (!name) return "N/A";
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };
  
  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const handleUpdate = async () => {
    if (selectedCategory === transaction.category) {
      setIsEditing(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      const updated = await Transaction.update(transaction.id, {
        ...transaction,
        category: selectedCategory
      });
      
      if (onUpdated) {
        onUpdated(updated);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update transaction category:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-white/10 rounded-lg transition-colors relative">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center">
          <span className="text-xs text-[var(--text-secondary)] mr-2">
            {formatDate(transaction.date)}
          </span>
          <span className="text-sm text-[var(--text-primary)] font-medium truncate">
            {transaction.description}
          </span>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="text-sm font-semibold text-red-500 mr-2">
          -{currency} {Math.abs(transaction.amount).toLocaleString()}
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2 z-50"> {/* Add z-index to fix dropdown visibility */}
            <Select 
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-7 w-24 text-xs bg-white/50 backdrop-blur-sm z-50"> {/* Add z-index */}
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="z-[100]"> {/* Fix z-index for dropdown */}
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {formatName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="h-7 w-7 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10 z-50" // Add z-index
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}