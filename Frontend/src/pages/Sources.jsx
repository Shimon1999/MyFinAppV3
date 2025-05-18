
import React, { useState, useEffect } from "react";
import { TransactionSource } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, Upload, Trash2, ExternalLink, AlertTriangle, RefreshCw, 
  Calendar, ChevronDown, X, Check 
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sourcesToDelete, setSourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const sourcesData = await TransactionSource.list('-created_date');
      setSources(sourcesData);
    } catch (error) {
      console.error("Error loading sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSource = async () => {
    if (!sourcesToDelete) return;
    
    setIsDeleting(true);
    try {
      // In a real implementation, you would:
      // 1. Delete the source
      await TransactionSource.delete(sourcesToDelete.id);
      
      // 2. Optionally delete associated transactions
      // In a complete implementation, you might want to also delete
      // transactions associated with this source via a backend function
      
      // Refresh the sources list
      loadSources();
    } catch (error) {
      console.error("Error deleting source:", error);
    } finally {
      setIsDeleting(false);
      setSourceToDelete(null);
    }
  };

  const bankSources = sources.filter(source => source.type === "bank");
  const csvSources = sources.filter(source => source.type === "csv");

  const renderEmptyState = (type) => {
    if (type === "bank") {
      return (
        <div className="text-center p-8 glass-card bg-white/50">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-[var(--primary-end)]/10 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-[var(--primary-end)]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">No Connected Banks</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Connect your bank account to automatically import transactions and keep your finances up to date
          </p>
          <Link to={createPageUrl("AddSource")}>
            <Button className="btn-gradient btn-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Connect Bank Account
            </Button>
          </Link>
        </div>
      );
    } else if (type === "csv") {
      return (
        <div className="text-center p-8 glass-card bg-white/50">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-[var(--primary-end)]/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-[var(--primary-end)]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">No CSV Imports</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Upload CSV files exported from your bank to quickly import transaction history
          </p>
          <Link to={createPageUrl("AddSource?tab=csv")}>
            <Button className="btn-gradient btn-gradient-primary">
              <Upload className="w-4 h-4 mr-2" /> Upload CSV
            </Button>
          </Link>
        </div>
      );
    } else {
      return (
        <div className="text-center p-8 glass-card bg-white/50">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-[var(--primary-end)]/10 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-[var(--primary-end)]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">No Account Sources</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Connect a bank account or upload CSV files to import your transactions
          </p>
          <Link to={createPageUrl("AddSource")}>
            <Button className="btn-gradient btn-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Add Account Source
            </Button>
          </Link>
        </div>
      );
    }
  };

  const renderSourcesList = (sourcesList, type) => {
    if (!sourcesList.length) {
      return renderEmptyState(type);
    }
    
    return (
      <div className="space-y-4">
        {sourcesList.map(source => (
          <div 
            key={source.id}
            className="glass-card p-4 bg-white/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {source.logo_url ? (
                  <div className="w-12 h-12 rounded-lg bg-white shadow-inner flex items-center justify-center p-1.5">
                    <img 
                      src={source.logo_url} 
                      alt={source.bank_name || source.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[var(--primary-end)]/10 flex items-center justify-center">
                    {source.type === "csv" ? (
                      <Upload className="w-6 h-6 text-[var(--primary-end)]" />
                    ) : (
                      <CreditCard className="w-6 h-6 text-[var(--primary-end)]" />
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{source.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    {source.type === "bank" && source.account_number && (
                      <span>•••• {source.account_number.slice(-4)}</span>
                    )}
                    {source.type === "csv" && source.last_sync && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Imported {format(new Date(source.last_sync), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="capitalize">{source.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {source.status === "needs_reauth" && (
                  <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 bg-amber-50">
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reconnect
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSourceToDelete(source)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAllSources = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse bg-white/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/40"></div>
                <div>
                  <div className="h-5 w-36 bg-white/40 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-white/40 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!sources.length) {
      return renderEmptyState();
    }

    return (
      <div>
        {bankSources.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">Connected Banks</h2>
              <Link to={createPageUrl("AddSource?tab=bank")}>
                <Button size="sm" className="btn-gradient btn-gradient-primary">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Bank
                </Button>
              </Link>
            </div>
            {renderSourcesList(bankSources, "bank")}
          </div>
        )}
        
        {csvSources.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">CSV Imports</h2>
              <Link to={createPageUrl("AddSource?tab=csv")}>
                <Button size="sm" className="btn-gradient btn-gradient-primary">
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload CSV
                </Button>
              </Link>
            </div>
            {renderSourcesList(csvSources, "csv")}
          </div>
        )}
        
        {bankSources.length === 0 && csvSources.length === 0 && renderEmptyState()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Accounts</h1>
          <p className="text-[var(--text-secondary)]">Manage your connected accounts and CSV imports</p>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
          <TabsList className="glass-card !rounded-xl p-1 bg-white/50">
            <TabsTrigger 
              value="all" 
              className={cn(
                "relative text-sm rounded-lg py-2.5 px-6 transition-all duration-200",
                "data-[state=active]:text-white data-[state=active]:font-medium",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-start)] data-[state=active]:to-[var(--primary-end)]",
                "data-[state=active]:shadow-md",
                "data-[state=inactive]:text-[var(--text-secondary)]",
                "data-[state=inactive]:hover:bg-gray-100/50",
                "data-[state=inactive]:hover:text-[var(--text-primary)]"
              )}
            >
              All Sources
            </TabsTrigger>
            <TabsTrigger 
              value="banks" 
              className={cn(
                "relative text-sm rounded-lg py-2.5 px-6 transition-all duration-200",
                "data-[state=active]:text-white data-[state=active]:font-medium",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-start)] data-[state=active]:to-[var(--primary-end)]",
                "data-[state=active]:shadow-md",
                "data-[state=inactive]:text-[var(--text-secondary)]",
                "data-[state=inactive]:hover:bg-gray-100/50",
                "data-[state=inactive]:hover:text-[var(--text-primary)]"
              )}
            >
              Banks
            </TabsTrigger>
            <TabsTrigger 
              value="csv" 
              className={cn(
                "relative text-sm rounded-lg py-2.5 px-6 transition-all duration-200",
                "data-[state=active]:text-white data-[state=active]:font-medium",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-start)] data-[state=active]:to-[var(--primary-end)]",
                "data-[state=active]:shadow-md",
                "data-[state=inactive]:text-[var(--text-secondary)]",
                "data-[state=inactive]:hover:bg-gray-100/50",
                "data-[state=inactive]:hover:text-[var(--text-primary)]"
              )}
            >
              CSV Imports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">{renderAllSources()}</TabsContent>
          <TabsContent value="banks">{renderSourcesList(bankSources, "bank")}</TabsContent>
          <TabsContent value="csv">{renderSourcesList(csvSources, "csv")}</TabsContent>
        </Tabs>
        
        {!isLoading && sources.length > 0 && (
          <div className="flex justify-center mt-8">
            <Link to={createPageUrl("AddSource")}>
              <Button className="glass-card !border-white/30 text-[var(--text-primary)] hover:!shadow-md px-6">
                <Plus className="w-4 h-4 mr-2" /> Add a new account source
              </Button>
            </Link>
          </div>
        )}
        
        <Dialog open={!!sourcesToDelete} onOpenChange={() => setSourceToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Account Source</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {sourcesToDelete?.name}? 
                {sourcesToDelete?.type === "csv" && (
                  " All transactions imported from this CSV will be deleted."
                )}
                {sourcesToDelete?.type === "bank" && (
                  " Your account will be disconnected, but existing transactions will remain."
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="glass-card bg-red-50 border-red-100 p-3 text-sm text-red-700 flex items-center gap-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>This action cannot be undone.</span>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSourceToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteSource}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Removing..." : "Remove Source"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
