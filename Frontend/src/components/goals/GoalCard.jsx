import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  PiggyBank, Target, Plane, Home, Car, Gift, Book, 
  MoreVertical, Plus, Pencil, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddFundsModal from "./AddFundsModal";

const goalIcons = {
  savings: PiggyBank,
  target: Target,
  travel: Plane,
  house: Home,
  car: Car,
  gift: Gift,
  education: Book
};

export default function GoalCard({ goal, onAddFunds, onEdit, onDelete }) {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const IconComponent = goalIcons[goal.icon?.toLowerCase()] || PiggyBank;
  const percentage = Math.round((goal.current_amount / goal.target_amount) * 100);
  const timeLeft = formatDistanceToNow(new Date(goal.target_date), { addSuffix: true });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "var(--shadow-xl)" }}
      className="bg-white rounded-2xl shadow-lg p-6 transition-shadow"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            style={{ 
              background: `linear-gradient(135deg, var(--primary-start), var(--primary-end))`,
            }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">{goal.name}</h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-full"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white rounded-lg shadow-lg p-1">
            <DropdownMenuItem 
              className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => onEdit(goal)}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit Goal
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center py-2 px-4 text-sm text-red-600 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Goal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              className="stroke-current text-gray-200"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              className="stroke-current"
              strokeWidth="8"
              fill="none"
              initial={{ strokeDasharray: "0 276.46" }}
              animate={{ 
                strokeDasharray: `${(percentage / 100) * 276.46} 276.46`,
                stroke: "url(#gradient)" 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                strokeLinecap: "round",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{percentage}%</span>
          </div>
          {/* Gradient definition */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-start)" />
                <stop offset="100%" stopColor="var(--primary-end)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex-1">
          <div className="mb-2">
            <div className="text-lg font-semibold">
              {goal.currency} {goal.current_amount.toLocaleString()} / {goal.target_amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Target: {format(new Date(goal.target_date), "MMM d, yyyy")}
            </div>
          </div>
          <div className="text-sm font-medium" style={{ 
            background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Button
          className="flex-1 btn-gradient btn-gradient-primary"
          onClick={() => setShowAddFunds(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Funds
        </Button>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        goalName={goal.name}
        currency={goal.currency}
        onSubmit={async (amount) => {
          await onAddFunds(goal.id, amount);
          setShowAddFunds(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{goal.name}" goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(goal.id);
                setShowDeleteConfirm(false);
              }} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}