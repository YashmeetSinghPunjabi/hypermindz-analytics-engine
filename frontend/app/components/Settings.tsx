import React from 'react';
import { Settings, Database } from 'lucide-react';

interface SettingsProps {
  isCompact: boolean;
  theme: string;
  handleThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  handleCompactToggle: () => void;
  handleReSeedData: () => void;
  handleSignOut: () => void;
  setShowOnboarding?: (show: boolean) => void;
}

export default function SettingsTab({
  isCompact,
  theme,
  handleThemeChange,
  handleCompactToggle,
  handleReSeedData,
  handleSignOut,
  setShowOnboarding
}: SettingsProps) {
  return (
    <div className={`${isCompact ? 'p-4' : 'p-4 sm:p-8'} max-w-2xl space-y-6 flex-1`}>
      <h1 className="text-2xl font-black text-slate-800 mb-6">User Settings</h1>

      {/* Sleek User Guide Banner */}
      <div className="bg-gradient-to-r from-slate-500 to-slate-700 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <h3 className="text-sm font-bold flex items-center gap-2"><Settings className="h-4.5 w-4.5" /> Quick Guide: Settings</h3>
          <p className="text-xs text-slate-200 font-medium">
            Configure application-wide preferences. Customize theme settings, toggle compact layouts, re-seed sample datasets, or log out of your session safely.
          </p>
        </div>
        {setShowOnboarding && (
          <button
            onClick={() => setShowOnboarding(true)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 transition-all shadow-sm z-10 shrink-0 w-full md:w-auto text-center"
          >
            Launch Full Guide
          </button>
        )}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      </div>

      {/* UI Customization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Settings className="h-4 w-4 text-indigo-600" /> Interface Preferences
        </h2>

        {/* Interface Theme */}

        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-700">Application Theme</h4>
            <p className="text-[10px] text-slate-400 font-medium">Switch between light and dark modes.</p>
          </div>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <div className="flex justify-between items-center py-2">
          <div>
            <h4 className="text-xs font-bold text-slate-700">Compact Layout</h4>
            <p className="text-[10px] text-slate-400 font-medium">Reduce whitespace and padding for higher density.</p>
          </div>
          <div
            onClick={handleCompactToggle}
            className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${isCompact ? 'bg-indigo-500' : 'bg-slate-200'}`}
          >
            <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isCompact ? 'translate-x-4.5' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </div>

      {/* Seed Actions Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Database className="h-4 w-4 text-indigo-600" /> Sandbox Database Operations
        </h2>
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-700">Seeded E-Commerce Dataset</h4>
            <p className="text-[10px] text-slate-400 font-medium">Re-add the pre-loaded 550 rows sales data csv to your catalog if deleted.</p>
          </div>
          <button
            onClick={handleReSeedData}
            className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 font-bold px-4 py-2 rounded-xl transition-all text-xs"
          >
            Seed Sample CSV
          </button>
        </div>

        <div className="flex justify-between items-center py-2">
          <div>
            <h4 className="text-xs font-bold text-slate-700">Reset Session</h4>
            <p className="text-[10px] text-slate-400 font-medium">Clear auth cookies, localStorage parameters, and log out.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2 rounded-xl transition-all text-xs"
          >
            Reset Active Session
          </button>
        </div>
      </div>
    </div>
  );
}
