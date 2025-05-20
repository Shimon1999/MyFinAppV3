import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Simple transaction item for weekly breakdown
function WeeklyTransactionItem({ transaction, currency, onEditTransaction }) {
  return (
    <div className="flex justify-between items-center py-1.5 group hover:bg-gray-50/50 px-1 rounded-md">
      <div className="flex items-center">
        <span className="text-xs text-gray-700 truncate max-w-[120px] sm:max-w-[150px]">{transaction.description}</span>
        {transaction.is_non_cashflow && (
          <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0 bg-gray-100 text-gray-500 border-gray-300">NCF</Badge>
        )}
      </div>
      <div className="flex items-center">
          <span className={`text-xs font-medium mr-2 ${transaction.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {transaction.amount < 0 ? "-" : "+"}{currency} {Math.abs(transaction.amount).toLocaleString()}
          </span>
          <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-700 focus:opacity-100 transition-opacity"
              onClick={() => onEditTransaction(transaction)}
          >
              <Edit className="h-3.5 w-3.5" />
          </Button>
      </div>
    </div>
  );
}

// Week group component for expandable details
export default function WeekGroup({ weekNumber, weeklySpend, weeklyBudget, transactions, currency, onEditTransaction, isNonCashflow = false }) {
  const [isWeekExpanded, setIsWeekExpanded] = useState(false);
  const remainingInWeek = weeklyBudget > 0 ? (weeklyBudget / 4) - weeklySpend : 0; 
  const isOverBudgetInWeek = weeklySpend > (weeklyBudget / 4) && weeklyBudget > 0;

  return (
    <div className="py-2 border-b border-gray-200 last:border-b-0">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsWeekExpanded(!isWeekExpanded)}
      >
        <div>
          <h4 className="text-sm font-medium text-gray-800">Week {weekNumber}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">
              {isNonCashflow ? "Amount" : "Spent"}: {currency} {weeklySpend.toLocaleString()}
            </span>
            {!isNonCashflow && weeklyBudget > 0 && (
               <span className={`text-xs ${isOverBudgetInWeek ? 'text-red-500' : 'text-green-600'}`}>
                 {isOverBudgetInWeek ? 'Over by' : 'Remaining:'} {currency} {Math.abs(remainingInWeek).toLocaleString()}
               </span>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
        >
          {isWeekExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isWeekExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-1.5 pl-2 overflow-hidden"
          >
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <WeeklyTransactionItem 
                  key={tx.id} 
                  transaction={tx} 
                  currency={currency} 
                  onEditTransaction={onEditTransaction}
                />
              ))
            ) : (
              <div className="text-xs text-gray-500 py-1.5 italic">
                No transactions for this week.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}