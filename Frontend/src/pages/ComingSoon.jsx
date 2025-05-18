import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react"; // Changed icon
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function ComingSoon() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 text-center glass-card" // Applied glass-card
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-lg">
          <Construction className="w-12 h-12 text-white" /> {/* Changed icon */}
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Coming Soon!</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          We're working hard to bring you this feature. Please check back soon!
        </p>
        
        <Button 
          className="btn-gradient btn-gradient-primary" // Applied gradient button
          onClick={() => navigate(-1)} // Go back to previous page
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </motion.div>
    </div>
  );
}