import React from 'react';
import { LayoutDashboard, Database, MessageSquare, Settings, Sparkles, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  onDismiss: () => void;
}

export default function OnboardingModal({ onDismiss }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-6 md:px-8 md:py-10 text-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="bg-white/20 p-2.5 md:p-3 rounded-full mb-3 md:mb-4 ring-4 ring-white/10">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">Welcome to HyperMindZ</h2>
            <p className="text-xs md:text-sm text-indigo-100 mt-1 md:mt-2 font-medium">Your natural language SQL analytics sandbox.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-8 space-y-4 md:space-y-6 bg-slate-50 overflow-y-auto flex-1">
          <p className="text-xs md:text-sm font-semibold text-slate-600 text-center mb-2 md:mb-4">
            Here is a quick overview of how to operate the application:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Dashboard */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex gap-3 md:gap-4 items-start">
              <div className="bg-indigo-50 p-2 md:p-2.5 rounded-lg shrink-0">
                <LayoutDashboard className="h-4.5 w-4.5 md:h-5 md:w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs md:text-sm">1. Dashboard</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 font-medium leading-relaxed">View high-level metrics and jump directly into your uploaded datasets.</p>
              </div>
            </div>
            
            {/* Catalog */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex gap-3 md:gap-4 items-start">
              <div className="bg-blue-50 p-2 md:p-2.5 rounded-lg shrink-0">
                <Database className="h-4.5 w-4.5 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs md:text-sm">2. Data Catalog</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 font-medium leading-relaxed">Upload new CSV files here. They are securely parsed and prepared for querying.</p>
              </div>
            </div>

            {/* Playground */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex gap-3 md:gap-4 items-start">
              <div className="bg-emerald-50 p-2 md:p-2.5 rounded-lg shrink-0">
                <MessageSquare className="h-4.5 w-4.5 md:h-5 md:w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs md:text-sm">3. Playground</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 font-medium leading-relaxed">Ask questions in plain English! We generate SQL, run it, and graph the results.</p>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex gap-3 md:gap-4 items-start">
              <div className="bg-rose-50 p-2 md:p-2.5 rounded-lg shrink-0">
                <Settings className="h-4.5 w-4.5 md:h-5 md:w-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs md:text-sm">4. Settings</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 font-medium leading-relaxed">Toggle light/dark modes, re-seed sample data, or reset your active session.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 md:px-8 md:py-5 bg-white border-t border-slate-200 flex justify-center shrink-0">
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 md:py-3 md:px-8 rounded-xl shadow-md hover:shadow-lg transition-all text-xs md:text-sm cursor-pointer"
          >
            <CheckCircle2 className="h-4.5 w-4.5 md:h-5 md:w-5" /> Got it, let's start!
          </button>
        </div>

      </div>
    </div>
  );
}
