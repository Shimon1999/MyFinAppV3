import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary-start)] via-[var(--primary-end)] to-[var(--accent-start)] p-4">
       <style jsx global>{`
        body {
          overflow-x: hidden; /* Prevent horizontal scroll on auth pages */
        }
        :root {
          --primary-start: #00C6FF;
          --primary-end: #0072FF;
          --accent-start: #FF758C;
          --accent-end: #FF7EB3;
          --surface: #FFFFFF;
          --surface-light: #F0F0F0;
          --text-primary: #212121;
          --text-secondary: #666666;
        }
         .btn-gradient-primary {
          background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
          color: white;
          border: none;
          border-radius: 0.75rem; /* 12px */
          padding: 0.75rem 1.5rem; /* 12px 24px */
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .btn-gradient-primary:hover:not(:disabled) {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
          background: linear-gradient(135deg, var(--primary-end), var(--primary-start));
        }
        .btn-gradient-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      <Link to={createPageUrl("home")} className="mb-8">
        <h1 className="text-4xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">MyFin</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-pink-400">App</span>
        </h1>
      </Link>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}