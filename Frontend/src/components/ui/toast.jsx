import React, { useState, useEffect, createContext, useContext } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Toast context
const ToastContext = createContext(null);

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "default", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = {
    toasts,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  const toast = (message, type = "default", duration = 3000) => {
    return context.addToast(message, type, duration);
  };
  
  // Add helper methods
  toast.success = (message, duration) => context.addToast(message, "success", duration);
  toast.error = (message, duration) => context.addToast(message, "error", duration);
  toast.warning = (message, duration) => context.addToast(message, "warning", duration);
  toast.info = (message, duration) => context.addToast(message, "info", duration);
  
  return toast;
}

// Toaster component that displays the toasts
function Toaster() {
  const { toasts, removeToast } = useContext(ToastContext);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual toast component
function Toast({ toast, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        rounded-xl py-3 px-4 flex items-center justify-between shadow-lg
        ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
        ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
        ${toast.type === 'warning' ? 'bg-amber-500 text-white' : ''}
        ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
        ${toast.type === 'default' ? 'glass-card' : ''}
      `}
    >
      <span>{toast.message}</span>
      <button 
        onClick={() => onClose(toast.id)} 
        className="ml-4 text-white opacity-80 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export default ToastProvider;