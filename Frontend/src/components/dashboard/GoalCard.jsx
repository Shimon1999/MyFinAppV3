import React from "react";
import { format, formatDistanceToNowStrict, parseISO, isPast } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Edit, Trash2, TrendingDown, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function GoalCard({ 
  id,
  name, 
  current, 
  target, 
  currency = "AED", 
  color = "var(--primary-end)", 
  targetDate,
  icon,
  isCompleted = false,
  onAddFunds,
  onRemoveFunds,
  onEditGoal,
  onDeleteGoal,
  onMarkCompleted,
  onReopenGoal
}) {
  const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const formattedPercentage = percentage.toFixed(0);
  
  const getRemainingTimeText = () => {
    if (!targetDate) return "No target date";
    
    const targetDateObj = parseISO(targetDate);
    
    if (isPast(targetDateObj)) {
      return "Goal date passed";
    }
    
    return `${formatDistanceToNowStrict(targetDateObj)} left`;
  };

  const isOverdue = targetDate && isPast(parseISO(targetDate));
  
  const strokeWidth = 8;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circumference;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "var(--shadow-lg)" }}
      className={`glass-card p-5 h-full flex flex-col ${isCompleted ? 'bg-gray-50/80' : ''}`}
    >
      <div className="flex items-start mb-4">
        <div className="mr-4 relative flex-shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90" className="transform -rotate-90">
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={isCompleted ? "#4CAF50" : color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - dash }}
              transition={{ duration: 1.2, ease: "circOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isCompleted ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : (
              <span className="text-lg font-bold text-[var(--text-primary)]">{formattedPercentage}%</span>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[var(--text-primary)] mb-1 truncate" title={name}>
              {name}
              {isCompleted && <span className="ml-2 text-xs text-green-600 font-normal">(Completed)</span>}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-full"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEditGoal(id)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Goal
                </DropdownMenuItem>
                {!isCompleted && (
                  <>
                    <DropdownMenuItem onClick={() => onRemoveFunds(id)}>
                      <TrendingDown className="w-4 h-4 mr-2" /> Remove Funds
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkCompleted(id)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                    </DropdownMenuItem>
                  </>
                )}
                {isCompleted && (
                  <DropdownMenuItem onClick={() => onReopenGoal(id)}>
                    <Edit className="w-4 h-4 mr-2" /> Reopen Goal
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600" onClick={() => onDeleteGoal(id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Remove Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mb-2">
            <div className="flex items-baseline">
              <span className={`text-xl font-bold ${isCompleted ? 'text-gray-700' : 'text-[var(--text-primary)]'}`}>
                {currency} {current.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--text-secondary)] ml-1 truncate">
                / {currency} {target.toLocaleString()}
              </span>
            </div>
            
            {targetDate && (
              <div className="text-xs text-[var(--text-secondary)] truncate" title={format(parseISO(targetDate), "PPP")}>
                Target: {format(parseISO(targetDate), "MMM d, yyyy")}
              </div>
            )}
          </div>
          
          {!isCompleted && (
            <div className={`text-xs font-medium ${isOverdue ? "text-red-500" : "text-green-600"}`}>
              {getRemainingTimeText()}
            </div>
          )}
          {isCompleted && (
            <div className="text-xs font-medium text-green-600">
              Goal completed
            </div>
          )}
        </div>
      </div>
      
      {!isCompleted && (
        <Button
          onClick={() => onAddFunds(id)} 
          className="w-full mt-auto bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Funds
        </Button>
      )}
    </motion.div>
  );
}