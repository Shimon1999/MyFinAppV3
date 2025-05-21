import React, { useState, useEffect } from "react";
import { FinancialGoal } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import GoalCard from "../components/goals/GoalCard";
import AddGoalModal from "../components/goals/AddGoalModal";
import { ToastProvider } from "@/components/ui/toast";
import { useToast }      from "@/components/ui/use-toast";

function GoalsContent() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const fetchedGoals = await FinancialGoal.list();
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
      toastError("Failed to load goals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    try {
      const updatedGoal = await FinancialGoal.update(goalId, {
        current_amount: goal.current_amount + amount
      });

      setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
      toastSuccess(`Added ${amount} to ${goal.name}`);
    } catch (error) {
      console.error("Error adding funds:", error);
      toastError("Failed to add funds");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await FinancialGoal.delete(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
      toastSuccess("Goal deleted");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toastError("Failed to delete goal");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Financial Goals</h1>
          <Button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient btn-gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" /> New Goal
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddFunds={handleAddFunds}
                onDelete={handleDeleteGoal}
                onEdit={(goal) => {
                  setEditingGoal(goal);
                  setShowAddModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 glass-card"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center mb-4">
              <PiggyBank className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Start tracking your financial goals by creating your first one
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="btn-gradient btn-gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Your First Goal
            </Button>
          </motion.div>
        )}
      </div>

      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={async (goalData) => {
          try {
            if (editingGoal) {
              const updated = await FinancialGoal.update(editingGoal.id, goalData);
              setGoals(goals.map(g => g.id === editingGoal.id ? updated : g));
              toastSuccess("Goal updated successfully");
            } else {
              const created = await FinancialGoal.create(goalData);
              setGoals([...goals, created]);
              toastSuccess("Goal created successfully");
            }
            setShowAddModal(false);
            setEditingGoal(null);
          } catch (error) {
            console.error("Error saving goal:", error);
            toastError("Failed to save goal");
          }
        }}
      />
    </div>
  );
}

export default function Goals() {
  return (
    <ToastProvider>
      <GoalsContent />
    </ToastProvider>
  );
}