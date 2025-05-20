
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  ArrowRight, ChevronDown, LogIn, UserPlus, 
  UploadCloud, Cpu, BarChartBig, TrendingUp, ShieldCheck, Users, Eye
} from "lucide-react";

const HeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden z-0">
    <div className="w-full h-full">
      {/* We use a pseudo-element via CSS for the animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00C6FF] via-[#0072FF] to-[#FF758C] opacity-90 animate-gradient"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>
    </div>
  </div>
);


export default function Home() {
  const navigate = useNavigate();
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoadingUser(true);
      try {
        await User.me();
        setIsLoggedIn(true); 
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setIsLoadingUser(false);
      }
    };
    checkLoginStatus();
  }, []);

  const navLinks = [
    { name: "How It Works", href: createPageUrl("ComingSoon") },
    { name: "Features", href: createPageUrl("ComingSoon") },
    { name: "Pricing", href: createPageUrl("ComingSoon") },
  ];

  const features = [
    {
      icon: <UploadCloud className="w-10 h-10 text-white" />,
      title: "Upload CSV or Connect Banks",
      description: "Start with CSVs today. Secure bank connections coming soon for seamless data import."
    },
    {
      icon: <Cpu className="w-10 h-10 text-white" />,
      title: "Auto-Categorize Transactions",
      description: "Our smart engine automatically sorts your expenses and income, saving you time."
    },
    {
      icon: <BarChartBig className="w-10 h-10 text-white" />,
      title: "Real-Time Budgets & Goals",
      description: "Visually track your spending against budgets and monitor progress towards financial goals."
    },
    {
      icon: <Eye className="w-10 h-10 text-white" />, 
      title: "Visualize Monthly Trends",
      description: "Gain insights into your financial habits with clear month-over-month comparisons."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        /* Enhanced styles for login buttons */
        .login-button {
          background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
          color: white;
          font-weight: 600;
          transition: all 0.3s ease-out;
        }
        
        .login-button:hover {
          background: linear-gradient(135deg, var(--primary-end), var(--primary-start));
          transform: translateY(-2px);
        }
        
        .login-button:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        
        .login-button-outline {
          border: 2px solid white;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease-out;
        }
        
        .login-button-outline:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: var(--primary-start);
        }

        .auth-button {
          height: 44px;
          padding: 0 24px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 16px;
          border-radius: 1rem;
          transition: all 0.2s ease-out;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .auth-button-primary {
          background: linear-gradient(to right, #00C6FF, #0072FF);
          color: white;
        }
        
        .auth-button-primary:hover:not(:disabled) {
          background: linear-gradient(to right, #0072FF, #00C6FF);
          transform: translateY(-1px);
        }
        
        .auth-button-primary:focus {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(99, 102, 241, 0.3);
        }
        
        .auth-button-outline {
          background: transparent;
          border: 2px solid white;
          color: white;
        }
        
        .auth-button-outline:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: #00C6FF;
        }
        
        .auth-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
      
      
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div 
              className="text-2xl font-bold cursor-pointer" 
              onClick={() => navigate(createPageUrl("home"))}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00C6FF] to-[#0072FF]">MyFin</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF758C] to-[#FF7EB3]">App</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => { e.preventDefault(); navigate(link.href);}}
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#0072FF] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            
            <div className="flex items-center gap-4">
              {isLoadingUser ? (
                <div className="flex gap-4">
                  <Button variant="outline" className="opacity-50" disabled>Loading...</Button>
                  <Button className="opacity-50" disabled>Loading...</Button>
                </div>
              ) : isLoggedIn ? (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                >
                  Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate(createPageUrl("Login"))} // Navigate to Login page
                  >
                    <LogIn className="mr-2 w-4 h-4" /> Login
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate(createPageUrl("Register"))} // Navigate to Register page
                  >
                    <UserPlus className="mr-2 w-4 h-4" /> Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 min-h-[70vh] flex items-center">
        <HeroBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-md"
          >
            Be on top of your money
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md"
          >
            MyFinApp helps you upload your bank data or CSV and instantly see budgets, goals & trends.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            {isLoadingUser ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 w-40 sm:w-48 bg-white/20 animate-pulse rounded-full"></div>
                <div className="h-12 w-40 sm:w-48 bg-white/20 animate-pulse rounded-full"></div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate(createPageUrl("Register"))} // Navigate to Register page
                  className="
                    w-full sm:w-auto h-12 px-6
                    flex items-center justify-center
                    bg-gradient-to-r from-[#00C6FF] to-[#0072FF]
                    text-white font-semibold
                    rounded-full shadow-lg
                    hover:from-[#0072FF] hover:to-[#00C6FF] hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300
                    transition-all duration-300
                  "
                  aria-label="Register"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register
                </button>
                
                <button
                  onClick={() => navigate(createPageUrl("Login"))} // Navigate to Login page
                  className="
                    w-full sm:w-auto h-12 px-6
                    flex items-center justify-center
                    bg-transparent
                    border-2 border-[#00C6FF]
                    text-white font-semibold
                    rounded-full
                    hover:bg-gradient-to-r hover:from-[#00C6FF]/20 hover:to-[#0072FF]/20
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300
                    transition-all duration-300
                  "
                  aria-label="Log in to your account"
                >
                  Login
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </>
            )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-white"
            onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown className="w-10 h-10 mx-auto animate-bounce cursor-pointer bg-white/20 rounded-full p-2" />
          </motion.div>
        </div>
      </section>

      
      <section id="features-section" className="py-20 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00C6FF] to-[#0072FF]">
              Smart Tools for Your Finances
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Take control with features designed for clarity and ease, presented in a friendly, dynamic interface.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover:shadow-xl transition-all duration-300 text-center h-full"
              >
                <div className="flex justify-center mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    index % 2 === 0 ? 'bg-gradient-to-br from-[#00C6FF] to-[#0072FF]' : 'bg-gradient-to-br from-[#FF758C] to-[#FF7EB3]'
                  } shadow-lg`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C6FF]/10 to-[#0072FF]/10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#00C6FF] to-[#0072FF]">
              How MyFinApp Works For You
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {icon: <ShieldCheck className="w-12 h-12 text-white mb-6" />, title: "Secure Data Handling", description: "Your financial data is encrypted and protected. We prioritize your privacy and security."},
                    {icon: <TrendingUp className="w-12 h-12 text-white mb-6" />, title: "Insightful Analytics", description: "Understand spending patterns, identify savings opportunities, and plan for the future."},
                    {icon: <Users className="w-12 h-12 text-white mb-6" />, title: "Community & Support", description: "Join savvy UAE residents. Get tips, share experiences, and access dedicated support."}
                ].map((item, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: idx * 0.15 }}
                        className="glass-card p-8 hover:shadow-xl transition-all h-full"
                    >
                        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-[#00C6FF] to-[#0072FF] shadow-lg">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold my-3 text-[var(--text-primary)]">{item.title}</h3>
                        <p className="text-[var(--text-secondary)]">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      
      <section className="py-16 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-8">Trusted by savvy individuals across the UAE</h3>
          <div className="mt-6 flex flex-wrap justify-center gap-12">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" fill="white" role="img"
                    className="mr-3">
                    <rect width="24" height="24" fill="none"/>
                    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm3.75,14.65A1,1,0,0,1,15,17H9a1,1,0,0,1-1-1V8A1,1,0,0,1,9,7h6a1,1,0,0,1,.75.35,1,1,0,0,1,.25.65v8A1,1,0,0,1,15.75,16.65ZM12,5a3,3,0,1,1-3,3A3,3,0,0,1,12,5Z"/>
                </svg>
                <span className="text-lg font-medium">ADCB Bank</span>
            </div>
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" fill="white" role="img"
                    className="mr-3">
                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 6c-3.313 0-6 2.687-6 6s2.687 6 6 6c3.314 0 6-2.687 6-6s-2.686-6-6-6z"/>
                </svg>
                <span className="text-lg font-medium">Emirati Fintech</span>
            </div>
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" fill="white" role="img"
                    className="mr-3">
                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 16l-4-4 1.41-1.41 2.59 2.58 6.59-6.59 1.41 1.42-8 8z"/>
                </svg>
                <span className="text-lg font-medium">Dubai SmartCity</span>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-24 text-center bg-[var(--surface)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF758C]/10 to-[#FF7EB3]/10"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FF758C] to-[#FF7EB3]">
            Ready to take control of your finances?
          </h2>
          <p className="text-[var(--text-secondary)] mb-12 text-lg">
            Join MyFinApp today and start your journey to financial clarity.
          </p>
          
          {isLoadingUser ? (
            <div className="h-14 w-56 sm:w-64 glass-card animate-pulse mx-auto rounded-xl"></div>
          ) : ( 
            <Button 
              className="bg-gradient-to-r from-[#FF758C] to-[#FF7EB3] text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              onClick={() => navigate(createPageUrl("Register"))} // Navigate to Register page
            >
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      
      <footer className="bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#0072FF] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-white">MyFin</span>
                <span className="text-[#FF7EB3]">App</span>
              </div>
              <p className="text-white/80">Be on top of your money.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2">
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Features</a></li>
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Pricing</a></li>
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2">
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">About Us</a></li>
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Careers</a></li>
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2">
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href={createPageUrl("ComingSoon")} onClick={(e) => {e.preventDefault(); navigate(createPageUrl("ComingSoon"));}} className="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/80">
              © {new Date().getFullYear()} MyFinApp — Made with ♥ in the UAE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
