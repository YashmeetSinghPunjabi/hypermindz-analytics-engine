import React from 'react';
import { Database, BarChart3, MessageSquare, FileSpreadsheet, Settings, User, LogOut, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'catalog' | 'settings' | 'playground';
  setActiveTab: (tab: 'dashboard' | 'catalog' | 'settings' | 'playground') => void;
  email: string;
  handleSignOut: () => void;
  setShowOnboarding?: (show: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, email, handleSignOut, setShowOnboarding }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 text-slate-800 flex flex-col shrink-0 z-20 shadow-sm relative">
      <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between md:justify-start space-x-3">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl shadow-sm border border-indigo-100">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 uppercase">HyperMindZ</h1>
            <p className="text-[10px] text-slate-500 font-bold hidden md:block">Analytics Engine v1.0</p>
          </div>
        </div>
      </div>

      <nav className="hidden md:flex flex-1 flex-col px-4 py-6 space-y-1.5 overflow-y-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'playground'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Playground</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'catalog'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Data Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'settings'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>

        {setShowOnboarding && (
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <HelpCircle className="h-4 w-4" />
            <span>User Guide</span>
          </button>
        )}
      </nav>

      {/* Mobile Nav Header (Horizontal quick links) */}
      <nav className="md:hidden flex px-2 py-2 overflow-x-auto space-x-2 bg-slate-50 border-b border-slate-200 hide-scrollbar">
        {['dashboard', 'playground', 'catalog', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`whitespace-nowrap flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all ${activeTab === tab
              ? 'bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar User Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50 hidden md:flex">
        <div className="flex items-center space-x-2 overflow-hidden mr-2">
          <div className="bg-slate-200 p-1.5 rounded-lg text-slate-600">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-600 truncate max-w-[120px]">{email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
          title="Log Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      
      {/* Mobile Logout (shows in header row on mobile) */}
      <button
          onClick={handleSignOut}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
          title="Log Out"
        >
          <LogOut className="h-4 w-4" />
      </button>
    </aside>
  );
}
