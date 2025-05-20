import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import CategoryTransactionItem from "./CategoryTransactionItem"; // Assuming this is already separate
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function WeeklyTransactionList({ 
  weekNumber, 
  weeklySpend, 
  weeklyBudget, 
  transactions, 
  isLoading,
  currency = "AED",
  onTransactionUpdated 
}) {
  const [isExpanded, setIsExpanded] = useState(false); // This is for expanding the list of transactions for THIS week
  const remaining = weeklyBudget - weeklySpend;
  const isOverBudget = weeklySpend > weeklyBudget;

  return (
    <motion.div
      layout // Animate layout changes for this weekly item
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-t border-white/20 py-3 last:border-b last:pb-3" // Add bottom border for last item
    >
      {/* Weekly Summary Row - Clickable to expand/collapse transactions for this week */}
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors" // Make clickable area larger and add hover
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)]">Week {weekNumber}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1"> {/* Flex wrap for smaller screens */}
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Spent: {currency} {weeklySpend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
            <span className={`text-xs font-bold ${isOverBudget ? 'text-[var(--error)]' : 'text-green-500'}`}> {/* Use theme colors */}
              {isOverBudget ? 'Over by' : 'Remaining'}: {currency} {Math.abs(remaining).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-transparent flex-shrink-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Transactions List - Expands when the weekly summary row is clicked */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-3 pl-2 space-y-1 overflow-hidden" // Add some padding and hide overflow during animation
          >
            {isLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-1.5">
                    <div className="flex items-center">
                      <Skeleton className="w-6 h-6 rounded-full mr-2 bg-white/30" />
                      <div>
                        <Skeleton className="h-3 w-28 bg-white/30 mb-1" />
                        <Skeleton className="h-2 w-20 bg-white/30" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-12 bg-white/30" />
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-1">
                {transactions.map(transaction => (
                  <CategoryTransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onUpdated={onTransactionUpdated}
                    currency={currency}
                  />
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-[var(--text-secondary)] text-xs italic">
                No transactions this week.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}