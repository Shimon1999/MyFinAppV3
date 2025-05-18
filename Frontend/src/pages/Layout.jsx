

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import { 
  Menu, X, Home as HomeIconPage, FileText, TrendingUp, CreditCard, 
  LogOut, ChevronRight, Plus, ChevronLeft, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import AddExpenseForm from "./components/expenses/AddExpenseForm";
import { TransactionSource } from "@/api/entities";

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const location = useLocation();
  const [transactionSources, setTransactionSources] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        const [userPrefs, sources] = await Promise.all([
          UserPreference.filter({ created_by: userData.email }),
          TransactionSource.list('-created_date')
        ]);
        
        setTransactionSources(sources);
        
        if (userPrefs.length > 0) {
          setPreferences(userPrefs[0]);
        } else {
          const newPrefs = await UserPreference.create({
            default_currency: "AED",
            date_format: "DD/MM/YYYY",
            has_completed_onboarding: false,
            selected_month: new Date().toISOString().slice(0, 7)
          });
          setPreferences(newPrefs);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
        setIsLoadingSources(false);
      }
    };

    loadUserData();
    if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
    } else {

    }

  }, []);
  

  if (currentPageName === "home" || currentPageName === "Onboarding" || currentPageName === "ComingSoon" || currentPageName === "CategoryTransactions" || loading) {
    if (currentPageName === "CategoryTransactions") {
         return (
            <div className="min-h-screen bg-[var(--surface)]">
                 {/* Basic styling for CategoryTransactions */}
                <style jsx global>{`
                    :root {
                      --primary-start: #00C6FF;
                      --primary-end: #0072FF;
                      --accent-start: #FF758C;
                      --accent-end: #FF7EB3;
                      
                      /* Surface Colors */
                      --surface: #FFFFFF;
                      --surface-light: #F0F0F0;
                      --divider: #E0E0E0;
                      
                      /* Text Colors */
                      --text-primary: #212121;
                      --text-secondary: #666666;
                      --text-light: #999999;
                    }
                    body {
                      font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
                      color: var(--text-primary);
                      background-color: var(--surface);
                    }
                 `}</style>
                {children}
            </div>
        );
    }
    return children;
  }
  if (preferences && !preferences.has_completed_onboarding && currentPageName !== "Onboarding") {
    window.location.href = createPageUrl("Onboarding");
    return null;
  }

  const handleExpenseAdded = (transaction) => {
    setShowAddExpense(false);
    window.location.reload();
  };

  const menuItems = [
    { name: "Dashboard", icon: HomeIconPage, path: "Dashboard" },
    { name: "My Transactions", icon: FileText, path: "Transactions" },
    { name: "My Progress", icon: TrendingUp, path: "Goals" },
    { name: "My Accounts", icon: CreditCard, path: "Sources" },
  ];

  const toggleSidebar = async () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderSourcesList = () => {
    if (isLoadingSources) {
      return (
        <div className="space-y-2 px-2">
          {[1, 2].map(i => (
            <div key={i} className="h-12 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    return (
      <div className="px-2 space-y-1">
        {transactionSources.map(source => (
          <Link
            key={source.id}
            to={createPageUrl(`Dashboard?source=${source.id}`)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              location.search.includes(`source=${source.id}`)
                ? "bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-light)]"
            )}
          >
            {source.logo_url ? (
              <div className="w-6 h-6 rounded bg-white/90 flex items-center justify-center p-1">
                <img src={source.logo_url} alt={source.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded bg-[var(--primary-end)]/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-[var(--primary-end)]" />
              </div>
            )}
            {!isSidebarCollapsed && (
              <span className="truncate">{source.name}</span>
            )}
          </Link>
        ))}
        
        <Link
          to={createPageUrl("Sources")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--primary-end)] hover:bg-[var(--primary-end)]/10 transition-all duration-200"
        >
          <div className="w-6 h-6 rounded bg-[var(--primary-end)]/10 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && (
            <span>Add Account</span>
          )}
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col overflow-x-hidden">
      <style jsx global>{`
        :root {
          --primary-start: #00C6FF;
          --primary-end: #0072FF;
          --accent-start: #FF758C;
          --accent-end: #FF7EB3;
          
          /* Surface Colors */
          --surface: #FFFFFF;
          --surface-light: #F0F0F0;
          --divider: #E0E0E0;
          
          /* Text Colors */
          --text-primary: #212121;
          --text-secondary: #666666;
          --text-light: #999999;
          
          /* Utility Colors */
          --success: #4CAF50;
          --warning: #FFC107;
          --error: #F44336;
          
          /* Effect Variables */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          
          /* Gradients */
          --gradient-primary: linear-gradient(135deg, var(--primary-start), var(--primary-end));
          --gradient-accent: linear-gradient(135deg, var(--accent-start), var(--accent-end));
          --gradient-blend: linear-gradient(135deg, var(--primary-end), var(--accent-start));
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text-primary);
          background-color: var(--surface);
          overflow-x: hidden; /* Prevent horizontal scrolling */
          width: 100%;
          position: relative;
        }
        
        .gradient-primary {
          background: var(--gradient-primary);
        }
        
        .gradient-accent {
          background: var(--gradient-accent);
        }
        
        .gradient-blend {
          background: var(--gradient-blend);
        }
        
        /* Glass Card Styles */
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-3px);
        }
        
        /* Gradient Button Styles */
        .btn-gradient {
          color: white;
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: var(--shadow);
        }
        
        .btn-gradient:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        .btn-gradient-primary {
          background: var(--gradient-primary);
        }
        .btn-gradient-accent {
          background: var(--gradient-accent);
        }

        /* Thin scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px; /* Height of horizontal scrollbar */
          width: 8px;  /* Width of vertical scrollbar */
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: var(--surface-light);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--primary-end);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--primary-start);
        }

        /* For Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: var(--primary-end) var(--surface-light);
        }
      `}</style>

      <header className="sticky top-0 z-30 glass-card !rounded-none !border-x-0 !border-t-0 !shadow-sm">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-[var(--text-primary)] hover:bg-transparent"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]">MyFinApp</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              <Button 
                className="md:flex items-center hidden text-white btn-gradient btn-gradient-primary"
                size="sm"
                onClick={() => setShowAddExpense(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Expense
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className={cn(
        "fixed inset-0 z-50 bg-black/30 md:hidden",
        isMenuOpen ? "block" : "hidden"
      )} onClick={() => setIsMenuOpen(false)}>
        <motion.div 
          className="fixed top-0 left-0 z-50 h-full w-3/4 max-w-sm md:w-64 glass-card !rounded-r-2xl !rounded-l-none !border-l-0 !border-y-0"
          initial={{ x: "-100%" }}
          animate={{ x: isMenuOpen ? "0%" : "-100%" }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="px-4 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]">MyFinApp</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(false)}
                className="text-[var(--text-primary)] hover:bg-transparent"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            {user && (
              <div className="p-4 border-b border-[var(--divider)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full btn-gradient btn-gradient-accent flex items-center justify-center text-sm font-bold text-white !p-0">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-[var(--text-primary)]">{user.full_name || "User"}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            <nav className="flex-1 overflow-y-auto p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200",
                    currentPageName === item.path 
                      ? "btn-gradient-primary text-white font-medium" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-light)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {currentPageName === item.path && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              ))}
              <Button
                className="w-full mt-4 text-white btn-gradient btn-gradient-primary"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowAddExpense(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Expense
              </Button>
            </nav>
            
            <div className="p-3 border-t border-[var(--divider)]">
              <Button
                variant="ghost"
                className="w-full justify-start font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-light)] rounded-xl"
                onClick={async () => {
                  await User.logout();
                  window.location.href = createPageUrl("home");
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.aside 
        className={cn(
          "hidden md:flex flex-col fixed top-0 left-0 z-20 h-full glass-card !rounded-r-2xl !rounded-l-none !border-l-0 !border-y-0 !shadow-lg",
          "transition-all duration-300"
        )}
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? '64px' : '256px',
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
            <div className={cn("h-16 flex items-center", isSidebarCollapsed ? "justify-center px-2" : "px-4")}>
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]"
                  >
                    MyFinApp
                  </motion.span>
                )}
              </AnimatePresence>
               {isSidebarCollapsed && (
                  <div className="w-6 h-6 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-md"></div>
               )}
            </div>
            
            {user && (
              <div className={cn(
                "border-b border-[var(--divider)]",
                isSidebarCollapsed ? "flex justify-center p-2 py-3" : "p-4" 
              )}>
                <AnimatePresence>
                  {isSidebarCollapsed ? (
                    <div className="w-10 h-10 rounded-full btn-gradient btn-gradient-accent flex items-center justify-center text-sm font-bold text-white !p-0">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full btn-gradient btn-gradient-accent flex items-center justify-center text-sm font-bold text-white !p-0">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-[var(--text-primary)]">{user.full_name || "User"}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className={cn("py-2", isSidebarCollapsed ? "px-0 flex justify-center" : "px-2")}>
                <Button
                    onClick={toggleSidebar}
                    variant="ghost"
                    className={cn(
                        "w-full flex items-center justify-center h-10 text-[var(--text-secondary)] hover:bg-[var(--surface-light)] hover:text-[var(--text-primary)] rounded-lg",
                        !isSidebarCollapsed && "gap-2"
                    )}
                    aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!isSidebarCollapsed}
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-[var(--primary-end)]" />
                    ) : (
                        <>
                           <ChevronLeft className="w-5 h-5 text-[var(--primary-end)]" />
                           <AnimatePresence>
                            {!isSidebarCollapsed && (
                                <motion.span initial={{ opacity: 0, width:0 }} animate={{ opacity: 1, width:'auto' }} exit={{ opacity: 0, width:0}} className="text-xs">Collapse</motion.span>
                            )}
                           </AnimatePresence>
                        </>
                    )}
                </Button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  title={item.name}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200",
                    currentPageName === item.path 
                      ? "btn-gradient-primary text-white font-medium" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-light)] hover:text-[var(--text-primary)]",
                    isSidebarCollapsed && "justify-center !px-0"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15, delay: 0.05 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!isSidebarCollapsed && currentPageName === item.path && (
                     <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                  )}
                </Link>
              ))}
              
            </nav>
            
            <div className={cn(
              "p-3 border-t border-[var(--divider)]",
              isSidebarCollapsed && "flex justify-center p-2"
            )}>
              <Button
                variant="ghost"
                className={cn(
                  "font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-light)] rounded-xl",
                  isSidebarCollapsed ? "w-10 h-10 p-0 flex items-center justify-center" : "w-full justify-start flex items-center gap-2"
                )}
                onClick={async () => {
                  await User.logout();
                  window.location.href = createPageUrl("home");
                }}
                title="Log Out"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width:0 }} animate={{ opacity: 1, width:'auto' }} exit={{ opacity: 0, width:0}}
                      transition={{ duration: 0.15, delay: 0.05 }}
                       className="overflow-hidden whitespace-nowrap"
                    >
                      Log Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
      </motion.aside>

      <main 
        className="flex-1 overflow-x-hidden relative w-full" 
        style={{ 
          marginLeft: window.innerWidth <= 768 ? 0 : (isSidebarCollapsed ? '64px' : '256px'),
          width: window.innerWidth <= 768 ? '100%' : `calc(100% - ${isSidebarCollapsed ? '64px' : '256px'})`,
          transition: 'margin-left 0.3s ease-out'
        }}
      >
        <div className="py-4 px-4 sm:px-6 lg:px-8 h-full w-full relative">
          {children}
        </div>
      </main>

      <AnimatePresence>
        {showAddExpense && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
            <div className="glass-card p-0.5">
               <AddExpenseForm 
                onClose={() => setShowAddExpense(false)}
                onSuccess={handleExpenseAdded}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

