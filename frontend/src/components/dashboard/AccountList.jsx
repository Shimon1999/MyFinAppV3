import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, PlusCircle, ExternalLink, Upload, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionSource } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccountList({ isLoading: propIsLoading }) {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      try {
        const sources = await TransactionSource.list('-created_date');
        setAccounts(sources);
      } catch (error) {
        console.error("Error fetching transaction sources:", error);
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const displayLoading = propIsLoading !== undefined ? propIsLoading : isLoading;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return null; // No badge for active, or use a subtle one if desired
      case 'needs_reauth':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-400 bg-orange-500/20 text-xs py-0.5 px-2">
            <AlertTriangle className="w-3 h-3 mr-1" /> Needs Reauth
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="text-red-600 border-red-400 bg-red-500/20 text-xs py-0.5 px-2">
            <AlertTriangle className="w-3 h-3 mr-1" /> Error
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs py-0.5 px-2">{status}</Badge>;
    }
  };
  
  const AccountCard = ({ account }) => (
    <motion.div
      key={account.id}
      whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
      className="glass-card p-4"
    >
      <div className="flex items-center">
        {account.logo_url && account.type === "bank" ? (
          <div className="w-10 h-10 rounded-lg mr-3 bg-white/50 backdrop-blur-sm flex items-center justify-center overflow-hidden p-1 shadow-inner">
            <img src={account.logo_url} alt={account.bank_name || account.name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg mr-3 bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-inner">
            {account.type === 'csv' ? 
              <Upload className="w-5 h-5 text-[var(--primary-end)]" /> :
              <CreditCard className="w-5 h-5 text-[var(--primary-end)]" />
            }
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[var(--text-primary)] truncate" title={account.name}>{account.name}</p>
            {getStatusBadge(account.status)}
          </div>
          
          <p className="text-xs text-[var(--text-secondary)] truncate">
            {account.type === "bank" ? (account.account_number || "Bank Account") : 
             account.type === "csv" ? (account.last_sync ? "Last import: " + new Date(account.last_sync).toLocaleDateString() : "CSV Source") :
             "Source"}
          </p>
        </div>
        {account.status === "needs_reauth" && (
             <Button variant="ghost" size="icon" className="ml-2 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-full">
                <RefreshCw className="w-4 h-4" />
            </Button>
        )}
      </div>
    </motion.div>
  );

  if (displayLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-lg mr-3 bg-white/30" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/5 mb-1.5 bg-white/30" />
                <Skeleton className="h-3 w-2/5 bg-white/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
      
      <Link to={createPageUrl("Sources")}>
        <motion.div
          whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
          className="glass-card p-4 flex items-center h-full cursor-pointer bg-white/50 hover:bg-white/70" // Lighter for "add"
        >
          <div className="w-10 h-10 rounded-lg mr-3 bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center shadow-md">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <p className="font-medium text-[var(--text-primary)]">Add Account or Upload CSV</p>
            <p className="text-xs text-[var(--text-secondary)]">Connect to your bank or import transactions</p>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}