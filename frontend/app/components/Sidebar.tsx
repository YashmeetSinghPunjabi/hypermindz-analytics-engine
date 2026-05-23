import React from 'react';
import { Database, BarChart3, MessageSquare, FileSpreadsheet, Settings, User, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'catalog' | 'settings' | 'playground';
  setActiveTab: (tab: 'dashboard' | 'catalog' | 'settings' | 'playground') => void;
  email: string;
  handleSignOut: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, email, handleSignOut }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white uppercase">HyperMindZ</h1>
          <p className="text-[10px] text-slate-500 font-bold">Analytics Engine v1.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'hover:bg-slate-800 hover:text-white'
            }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'playground'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'hover:bg-slate-800 hover:text-white'
            }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Playground</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'hover:bg-slate-800 hover:text-white'
            }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Data Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'hover:bg-slate-800 hover:text-white'
            }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Sidebar User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/20">
        <div className="flex items-center space-x-2 overflow-hidden mr-2">
          <div className="bg-slate-800 p-1.5 rounded-lg text-slate-400">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-400 truncate max-w-[120px]">{email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 transition-colors"
          title="Log Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
