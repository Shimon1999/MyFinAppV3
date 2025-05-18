
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import { Budget } from "@/api/entities";
import { FinancialGoal } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPageUrl } from "@/utils";
import { ChevronRight, Check, Upload, CreditCard, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    monthlyIncome: "",
    savingsGoal: "",
    savingsName: "Emergency Fund"
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          name: userData.full_name || ""
        }));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const checkOnboardingStatusAndUser = async () => {
      setIsLoadingStatus(true);
      try {
        const me = await User.me();
        setCurrentUser(me);
        const prefs = await UserPreference.filter({ created_by: me.email });
        if (prefs.length > 0 && prefs[0].has_completed_onboarding) {
          navigate(createPageUrl("Dashboard")); // Already onboarded
        }
        // If not onboarded or no prefs, stay on this page
      } catch (error) {
        // Not logged in, redirect to login
        console.error("User not authenticated for onboarding:", error);
        navigate(createPageUrl("Login"));
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkOnboardingStatusAndUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Update user name if provided
      if (formData.name && formData.name !== user.full_name) {
        await User.updateMyUserData({ full_name: formData.name });
      }
      
      // Create default budgets
      const monthString = new Date().toISOString().slice(0, 7); // Current month in YYYY-MM format
      const monthlyIncome = parseFloat(formData.monthlyIncome) || 10000;
      
      const defaultBudgets = [
        { category: "groceries", amount: monthlyIncome * 0.15, color: "#83C5BE", icon: "shopping-bag" },
        { category: "dining", amount: monthlyIncome * 0.1, color: "#FF6B6B", icon: "utensils" },
        { category: "transport", amount: monthlyIncome * 0.1, color: "#FFD166", icon: "car" },
        { category: "shopping", amount: monthlyIncome * 0.1, color: "#06D6A0", icon: "shopping-cart" },
        { category: "entertainment", amount: monthlyIncome * 0.05, color: "#118AB2", icon: "film" },
        { category: "utilities", amount: monthlyIncome * 0.1, color: "#073B4C", icon: "zap" },
        { category: "housing", amount: monthlyIncome * 0.2, color: "#8338EC", icon: "home" },
        { category: "healthcare", amount: monthlyIncome * 0.05, color: "#06D6A0", icon: "activity" },
        { category: "education", amount: monthlyIncome * 0.05, color: "#118AB2", icon: "book-open" },
        { category: "travel", amount: monthlyIncome * 0.05, color: "#FF6B6B", icon: "map" },
        { category: "other", amount: monthlyIncome * 0.05, color: "#14213D", icon: "more-horizontal" }
      ];
      
      // First, check for existing budgets for this month
      const existingBudgets = await Budget.filter({ month: monthString });
      const existingCategories = new Set(existingBudgets.map(b => b.category));
      
      // Only create budgets for categories that don't already exist
      const budgetsToCreate = defaultBudgets.filter(budget => !existingCategories.has(budget.category));
      
      if (budgetsToCreate.length > 0) {
        await Promise.all(budgetsToCreate.map(budget => 
          Budget.create({
            ...budget,
            month: monthString,
            currency: "AED"
          })
        ));
      }
      
      // Create savings goal if provided
      if (formData.savingsGoal) {
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);
        
        await FinancialGoal.create({
          name: formData.savingsName || "Emergency Fund",
          target_amount: parseFloat(formData.savingsGoal),
          current_amount: 0,
          currency: "AED",
          start_date: today.toISOString().slice(0, 10),
          target_date: sixMonthsLater.toISOString().slice(0, 10),
          color: "#006D77",
          icon: "shield"
        });
      }
      
      // Mark onboarding as completed
      const userPrefs = await UserPreference.filter({ created_by: user.email });
      if (userPrefs.length > 0) {
        await UserPreference.update(userPrefs[0].id, {
          has_completed_onboarding: true,
          selected_month: monthString
        });
      } else {
        await UserPreference.create({
          default_currency: "AED",
          date_format: "DD/MM/YYYY",
          has_completed_onboarding: true,
          selected_month: monthString
        });
      }
      
      // Redirect to dashboard
      window.location.href = createPageUrl("Dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsLoading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--base)]">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const steps = [
    {
      title: "Welcome to MyFinApp",
      description: "Let's set up your personal finance dashboard",
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[var(--text-primary)]">What should we call you?</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              className="h-12 rounded-lg text-lg glass-card !bg-white/50 !border-white/30 p-3"
            />
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleNextStep}
              className="w-full h-12 rounded-xl btn-gradient-primary"
            >
              Let's Get Started <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Set up your financial profile",
      description: "This helps us create personalized budgets for you",
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome" className="text-[var(--text-primary)]">What's your monthly income? (AED)</Label>
            <Input
              id="monthlyIncome"
              name="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={handleInputChange}
              placeholder="20,000"
              className="h-12 rounded-lg text-lg glass-card !bg-white/50 !border-white/30 p-3"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              This helps us create more accurate budget suggestions for you
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="savingsGoal" className="text-[var(--text-primary)]">What's your savings goal? (AED)</Label>
            <Input
              id="savingsGoal"
              name="savingsGoal"
              type="number"
              value={formData.savingsGoal}
              onChange={handleInputChange}
              placeholder="50,000"
              className="h-12 rounded-lg text-lg glass-card !bg-white/50 !border-white/30 p-3"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="savingsName" className="text-[var(--text-primary)]">Name for your savings goal</Label>
            <Input
              id="savingsName"
              name="savingsName"
              value={formData.savingsName}
              onChange={handleInputChange}
              placeholder="Emergency Fund"
              className="h-12 rounded-lg text-lg glass-card !bg-white/50 !border-white/30 p-3"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1 h-12 rounded-xl glass-card !p-0 hover:!shadow-md"
            >
              Back
            </Button>
            
            <Button 
              onClick={handleNextStep}
              className="w-full h-12 rounded-xl btn-gradient-primary"
            >
              Continue <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Choose how to import transactions",
      description: "Connect your bank or import a CSV file",
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div 
              className="glass-card !p-5 rounded-xl cursor-pointer transition-all hover:!shadow-md"
              onClick={handleNextStep}
            >
              <div className="flex items-start gap-3">
                <div className="neu-concave p-3 rounded-lg bg-[var(--base)]">
                  <Upload className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-[var(--text-primary)]">Upload CSV file</h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Import transactions from a CSV file exported from your bank
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
            </div>
            
            <div className="glass-card !p-5 rounded-xl cursor-not-allowed opacity-70">
              <div className="flex items-start gap-3">
                <div className="neu-concave p-3 rounded-lg bg-[var(--base)] opacity-50">
                  <CreditCard className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg text-[var(--text-secondary)]">Connect bank account</h3>
                    <span className="bg-[var(--base)] text-[var(--text-secondary)] text-xs px-2 py-0.5 rounded-full neu-pressed">Coming soon</span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Securely connect to your UAE bank account
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1 h-12 rounded-xl glass-card !p-0 hover:!shadow-md"
            >
              Back
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Upload your CSV file",
      description: "Export a CSV from your bank and upload it here",
      component: (
        <div className="space-y-6">
          <div 
            className="neu-concave rounded-xl p-8 text-center hover:brightness-95 transition-all cursor-pointer"
            onClick={handleNextStep} // This should likely trigger file input
          >
            <div className="flex flex-col items-center justify-center">
              <div className="neu-convex p-4 rounded-full mb-4 bg-[var(--base)]">
                <Upload className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h3 className="font-medium text-lg text-[var(--text-primary)]">Drag and drop your CSV file</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto mt-2">
                Or click to browse your files. We support exports from all major UAE banks
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1 h-12 rounded-xl glass-card !p-0 hover:!shadow-md"
            >
              Back
            </Button>

            <Button 
              onClick={handleCompleteOnboarding}
              className="w-full h-12 rounded-xl btn-gradient-primary"
            >
              Skip for now
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "You're all set!",
      description: "Let's start managing your finances",
      component: (
        <div className="space-y-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="neu-convex bg-[var(--accent)] p-5 rounded-full mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-medium text-2xl text-[var(--text-primary)]">Your account is ready!</h3>
            <p className="text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
              We've set up your personal finance dashboard with default budgets based on your income.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="glass-card !p-4 text-center rounded-xl">
              <div className="neu-concave p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 bg-[var(--base)]">
                <PiggyBank className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h4 className="font-medium text-[var(--text-primary)]">Track Spending</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">See where your money goes</p>
            </div>
            
            <div className="glass-card !p-4 text-center rounded-xl">
              <div className="neu-concave p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 bg-[var(--base)]">
                <CreditCard className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h4 className="font-medium text-[var(--text-primary)]">Budget Smart</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Set limits & reach goals</p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleCompleteOnboarding}
              className="w-full h-12 rounded-xl btn-gradient-primary"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--base)]"> {/* Use global variable */}
      <style jsx global>{`
        :root {
          /* Base Colors */
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
          background-color: var(--base); /* Use global variable */
        }

        .btn-gradient-primary {
          background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
          color: white;
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .btn-gradient-primary:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
      <div className="max-w-md mx-auto p-6">
        <div className="mb-10 pt-10 text-center">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]">MyFin</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]">App</span>
          </h1>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6 p-1 glass-card !rounded-full">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`h-1.5 flex-1 mx-0.5 rounded-full transition-colors duration-300 ${
                index <= currentStep ? "bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]" : "bg-white/30"
              }`}
            />
          ))}
        </div>
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 mb-8 glass-card"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{steps[currentStep].title}</h2>
            <p className="text-[var(--text-secondary)] mt-1">{steps[currentStep].description}</p>
          </div>
          
          {steps[currentStep].component}
        </motion.div>
      </div>
    </div>
  );
}
