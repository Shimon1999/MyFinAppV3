
import React, { useState } from "react";
import { 
  ArrowUp, ArrowDown, TrendingUp, Wallet, Gift, 
  ChevronDown, ChevronUp, MoreHorizontal, Folder, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SparkBar from "./SparkBar";
import { cn } from "@/lib/utils";
import IncomeBreakdownDrawer from "./IncomeBreakdownDrawer";

// New component for income transaction rows
const IncomeTransactionRow = ({ transaction, onEdit }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 group">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-sm text-gray-600 w-20">
          {format(new Date(transaction.date), "MMM d")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 truncate">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Folder className="w-3 h-3" />
              <span className="truncate">{transaction.source_name || "Account"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-green-600">
          AED {transaction.amount.toLocaleString()}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              Edit Transaction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              Flag as Non-Cashflow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default function SummaryCard({ 
  summary, 
  isLoading,
  month,
  selectedAccountName,
  noDataMessage,
  incomeTransactions, 
  onEditTransaction,
  onFlagNonCashflow,
  incomeBreakdown,
  expenseBreakdown
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 w-full">
        {[1,2,3].map(i => (
          <div key={i} className="glass-card p-5 w-full animate-pulse">
            <Skeleton className="h-6 w-24 mb-2 bg-gray-200/50" />
            <Skeleton className="h-8 w-32 mb-3 bg-gray-200/50" />
            <Skeleton className="h-5 w-full mb-4 bg-gray-200/50" />
            <Skeleton className="h-5 w-full bg-gray-200/50" />
          </div>
        ))}
      </div>
    );
  }

  if (noDataMessage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="glass-card p-5 w-full mx-auto"
      >
        <Alert variant="destructive" className="!bg-red-500/10 !border-red-500/30 text-red-700">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            {noDataMessage}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }
  
  const { income, expenses, balance } = summary;
  const currency = "AED";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full relative z-10"
      >
        <div className="mb-4">
          <h2 className="font-medium text-lg text-[var(--text-primary)]">
            Monthly Summary for {month}
          </h2>
          {selectedAccountName !== "All Accounts" && (
            <p className="text-xs text-[var(--text-secondary)]">
              Showing data for: {selectedAccountName}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Income Panel */}
          <div className="glass-card p-4 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-md text-green-700">Income</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-3 break-words">
                {currency} {income.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              
              <Button
                onClick={() => setIsDrawerOpen(true)}
                size="sm"
                className="w-full btn-gradient btn-gradient-primary text-xs h-8 py-1.5 px-3 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                View Income Breakdown <ArrowRight className="w-3.5 h-3.5 ml-1.5 flex-shrink-0" />
              </Button>

            </div>
            <div className="mt-4 h-5">
              {/* SparkBar data will be passed if incomeBreakdown is properly structured */}
            </div>
          </div>
          
          {/* Expenses Panel */}
          <div className="glass-card p-4 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDown className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-md text-red-700">Expenses</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 mb-3 break-words">
                {currency} {expenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              <div className="h-8"></div> {/* Placeholder */}
            </div>
            <div className="mt-4 h-5">
              {/* SparkBar data will be passed if expenseBreakdown is properly structured */}
            </div>
          </div>
          
          {/* Net Cash Flow Panel */}
          <div className="glass-card p-4 flex flex-col justify-center items-center relative w-full">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]"></div>
              <div className="flex items-center gap-2 mb-1 self-start w-full">
                  <TrendingUp className={`w-5 h-5 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                  <h3 className={`font-semibold text-md ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Cash Flow</h3>
              </div>
            <p className={`text-3xl font-extrabold text-center my-3 break-words ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {currency} {balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <div className="h-8"></div> {/* Placeholder */}
            <div className="mt-1 h-5 w-full self-stretch">
              {/* SparkBar data for net can be calculated if weekly income/expense data is available */}
            </div>
          </div>
        </div>
      </motion.div>

      <IncomeBreakdownDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        incomeTransactions={incomeTransactions || []}
        onEditTransaction={onEditTransaction}
        onFlagNonCashflow={onFlagNonCashflow}
        incomeBreakdown={incomeBreakdown || { expected: 0, unexpected: 0 }}
      />
    </>
  );
}
