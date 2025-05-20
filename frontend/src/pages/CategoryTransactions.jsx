
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Transaction } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import EditTransactionCategoryModal from "../components/transactions/EditTransactionCategoryModal";

const categoryIconsAndColors = {
    income: { icon: "trending-up", color: "#06D6A0", bgColor: "bg-green-100", textColor: "text-green-700" },
    groceries: { icon: "shopping-bag", color: "#83C5BE", bgColor: "bg-teal-100", textColor: "text-teal-700" },
    dining: { icon: "utensils", color: "#FF6B6B", bgColor: "bg-red-100", textColor: "text-red-700" },
    transport: { icon: "car", color: "#FFD166", bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
    shopping: { icon: "shopping-cart", color: "#06D6A0", bgColor: "bg-green-100", textColor: "text-green-700" },
    entertainment: { icon: "film", color: "#118AB2", bgColor: "bg-cyan-100", textColor: "text-cyan-700" },
    utilities: { icon: "zap", color: "#073B4C", bgColor: "bg-slate-100", textColor: "text-slate-700" },
    housing: { icon: "home", color: "#8338EC", bgColor: "bg-purple-100", textColor: "text-purple-700" },
    healthcare: { icon: "activity", color: "#06D6A0", bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
    education: { icon: "book-open", color: "#118AB2", bgColor: "bg-sky-100", textColor: "text-sky-700" },
    travel: { icon: "map", color: "#FF6B6B", bgColor: "bg-rose-100", textColor: "text-rose-700" },
    savings: { icon: "piggy-bank", color: "#FFD166", bgColor: "bg-amber-100", textColor: "text-amber-700" },
    other: { icon: "more-horizontal", color: "#14213D", bgColor: "bg-gray-100", textColor: "text-gray-700" }
};

export default function CategoryTransactionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [month, setMonth] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState("");

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const cat = queryParams.get("category");
    const mth = queryParams.get("month");
    setCategoryName(cat || "");
    setMonth(mth || "");

    if (cat && mth) {
      fetchTransactions(cat, mth);
    } else {
      setIsLoading(false);
    }
  }, [queryParams]);

  const fetchTransactions = async (category, month) => {
    setIsLoading(true);
    try {
      const data = await Transaction.filter({ category, month }, "-date");
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleCategoryUpdateSuccess = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
    setUpdateSuccessMessage(`Transaction category updated to "${formatCategoryName(updatedTransaction.category)}"`);
    setTimeout(() => setUpdateSuccessMessage(""), 3000); // Clear message after 3 seconds
  };

  const formatCategoryName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };
  
  const getCategoryStyle = (category) => {
    return categoryIconsAndColors[category] || categoryIconsAndColors.other;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--base)]">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] p-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))} className="mr-2 glass-card !p-2 !rounded-lg hover:!shadow-md text-[var(--text-primary)]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {formatCategoryName(categoryName)} Transactions
            <span className="text-sm text-[var(--text-secondary)] font-normal ml-2">
              ({transactions.length} item{transactions.length !== 1 ? 's' : ''} in {month ? format(parseISO(`${month}-01`), "MMMM yyyy") : ''})
            </span>
          </h1>
        </header>

        <AnimatePresence>
          {updateSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 glass-card !bg-green-500/20 !border-green-500/40 text-green-700 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{updateSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {transactions.length === 0 ? (
          <div className="text-center py-10 glass-card">
            <p className="text-[var(--text-secondary)]">No transactions found for this category and month.</p>
          </div>
        ) : (
          <div className="glass-card divide-y divide-[var(--divider)]/50">
            {transactions.map(transaction => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex items-center justify-between hover:bg-white/10 rounded-md transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="font-medium text-[var(--text-primary)] truncate">{transaction.description}</p>
                    {transaction.is_non_cashflow && (
                      <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0 bg-gray-100 text-gray-500 border-gray-300 whitespace-nowrap">NCF</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {format(parseISO(transaction.date), "MMM d, yyyy")}
                  </p>
                   <Badge 
                     variant="outline" 
                     className={`mt-1 text-xs ${getCategoryStyle(transaction.category).bgColor.replace('bg-', 'bg-opacity-20 ')} ${getCategoryStyle(transaction.category).textColor} border-none px-2 py-0.5 rounded-md`}
                     style={{ backgroundColor: `${getCategoryStyle(transaction.category).color}20` }} // More direct opacity
                    >
                    {formatCategoryName(transaction.category)}
                  </Badge>
                </div>
                <div className="flex items-center shrink-0">
                  <p className={`font-semibold mr-4 ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {transaction.currency || "AED"}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(transaction)} className="glass-card !p-1.5 !rounded-lg hover:!shadow-sm text-[var(--text-secondary)]">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {showEditModal && editingTransaction && (
        <EditTransactionCategoryModal
          transaction={editingTransaction}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleCategoryUpdateSuccess}
        />
      )}
    </div>
  );
}
