import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MonthSelector({ selectedMonth, monthDisplay, onPrevMonth, onNextMonth }) {
  return (
    <div className="flex items-center space-x-2 glass-card !p-1 !rounded-xl w-full sm:w-auto max-w-[90%] mx-auto">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevMonth}
        className="h-8 w-8 rounded-lg hover:bg-white/20 text-[var(--text-primary)] flex-shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <motion.div
        key={selectedMonth}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="font-medium text-base text-[var(--text-primary)] px-2 flex-1 text-center truncate min-w-0"
      >
        {monthDisplay}
      </motion.div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="h-8 w-8 rounded-lg hover:bg-white/20 text-[var(--text-primary)] flex-shrink-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}