import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Gift, MoreHorizontal, Folder, Edit, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TransactionRow = ({ transaction, onEditTransaction, onFlagNonCashflow }) => (
  <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50/50 group h-12"> {/* 48px height */}
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="text-sm text-gray-600 w-16 shrink-0">
        {format(new Date(transaction.date), "MMM d")}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate" title={transaction.description}>{transaction.description}</p>
        {transaction.source_name && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <Folder className="w-3 h-3" />
            <span className="truncate">{transaction.source_name}</span>
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 ml-3">
      <span className="text-base font-semibold text-green-600"> {/* 16px bold */}
        AED {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
            <Edit className="w-3.5 h-3.5 mr-2" /> Edit / Reclassify
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFlagNonCashflow(transaction)}>
            <Flag className="w-3.5 h-3.5 mr-2" /> Flag Non-Cashflow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

export default function IncomeBreakdownDrawer({
  isOpen,
  onClose,
  incomeTransactions,
  onEditTransaction,
  onFlagNonCashflow,
  incomeBreakdown,
}) {
  const [activeTab, setActiveTab] = useState("expected"); // "expected" or "unexpected"

  const tabs = [
    { id: "expected", label: "Salary / Recurring", icon: Wallet, total: incomeBreakdown?.expected || 0 },
    { id: "unexpected", label: "One-Off / Gifts", icon: Gift, total: incomeBreakdown?.unexpected || 0 },
  ];

  const filteredTransactions = useMemo(() => {
    if (!incomeTransactions) return [];
    return incomeTransactions.filter(t => t.income_type === activeTab);
  }, [incomeTransactions, activeTab]);

  const activeTabDetails = tabs.find(tab => tab.id === activeTab);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full md:w-[40%] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Income Breakdown</h2> {/* 1.25rem ~ 20px */}
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 py-3 px-2 text-sm text-center transition-colors duration-150 relative",
                    activeTab === tab.id
                      ? "font-semibold text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <div className="flex items-center justify-center">
                    {tab.icon && <tab.icon className={cn("w-4 h-4 mr-1.5", activeTab === tab.id ? "text-blue-600" : "text-gray-400")} />}
                    {tab.label}
                  </div>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeIncomeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Body: Transaction List */}
            <div className="flex-1 overflow-y-auto">
              {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredTransactions.map(tx => (
                    <TransactionRow 
                      key={tx.id} 
                      transaction={tx} 
                      onEditTransaction={onEditTransaction}
                      onFlagNonCashflow={onFlagNonCashflow}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-10">
                  <p className="text-gray-500 text-center">
                    No {activeTab === "expected" ? "recurring income" : "one-off income"} this month.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Total {activeTabDetails?.label}:
                </span>
                <span className="text-lg font-bold text-green-600">
                  AED {activeTabDetails?.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-white">
                  Close
                </Button>
                <Button onClick={onClose} className="flex-1 btn-gradient btn-gradient-primary">
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}