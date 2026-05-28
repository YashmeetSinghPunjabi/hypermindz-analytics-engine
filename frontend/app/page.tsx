"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Play, Database, Table, BarChart3, AlertCircle,
  FileSpreadsheet, Trash2, Eye, Settings, LogOut, User,
  History, Sparkles, MessageSquare, ChevronRight, RefreshCw,
  Plus, Check, HelpCircle, LineChart, PieChart, AreaChart, BarChart,
  Mail, Lock, EyeOff, Globe, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import SettingsTab from './components/Settings';
import DataCatalog from './components/DataCatalog';
import Playground from './components/Playground';
import OnboardingModal from "./components/OnboardingModal";
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

interface FileItem {
  id: string;
  file_name: string;
  table_name: string;
  row_count: number;
  columns: string[];
  uploaded_at: string;
}

interface ColumnProfile {
  name: string;
  type: string;
  count: number;
  unique_count: number;
  null_percentage: number;
  mean: number | null;
  min: any | null;
  max: any | null;
  top_values: { value: string; count: number }[];
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sql_query?: string;
  explanation?: string;
  data?: any[];
  visualization_config?: {
    recommended: boolean;
    type: string;
    x_axis_key: string | null;
    y_axis_key: string | null;
  };
  source_file?: string;
  isError?: boolean;
  isLoading?: boolean;
}

export default function AnalyticsDashboard() {
  // New UX States
  const [showPassword, setShowPassword] = useState(false);
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const defaultApiBase = process.env.NEXT_PUBLIC_API_URL || (isProd ? 'https://hypermindz-backend-1.onrender.com/api' : 'http://127.0.0.1:8000/api');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(defaultApiBase);
  const API_BASE = apiBaseUrl;

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App Layout State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'settings' | 'playground'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [isCompact, setIsCompact] = useState(false);

  // CSV Data State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);
  const [previewFileItem, setPreviewFileItem] = useState<FileItem | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Profiling State
  const [profilingFileItem, setProfilingFileItem] = useState<FileItem | null>(null);
  const [columnProfiles, setColumnProfiles] = useState<ColumnProfile[]>([]);
  const [profilingLoading, setProfilingLoading] = useState(false);

  // Uploading State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Querying & Terminal State
  const [nlQuery, setNlQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [chatThreads, setChatThreads] = useState<{ [fileId: string]: ChatMessage[] }>({});
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [dynamicSuggestions, setDynamicSuggestions] = useState<{ text: string; category: string }[]>([]);
  const [selectedChartOverride, setSelectedChartOverride] = useState<{ [msgIndex: number]: string }>({});
  const [selectedAiModel, setSelectedAiModel] = useState<string>("gemini-2.5-flash");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Auth Token from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("hm_token");
    const savedEmail = localStorage.getItem("hm_email");
    const savedUserId = localStorage.getItem("hm_userid");
    const savedApiBase = localStorage.getItem("hm_api_base");

    if (savedToken && savedEmail && savedUserId) {
      setToken(savedToken);
      setEmail(savedEmail);
      setUserId(savedUserId);
      
      const hasOnboarded = localStorage.getItem(`hm_onboarding_completed_${savedUserId}`) || localStorage.getItem("hm_onboarding_completed");
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
    }
    if (savedApiBase) {
      setApiBaseUrl(savedApiBase);
    }

    const savedTheme = localStorage.getItem(`hm_theme_${savedUserId || ""}`);
    if (savedTheme) {
      setTheme(savedTheme as any);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedCompact = localStorage.getItem(`hm_compact_${savedUserId || ""}`);
    if (savedCompact === 'true') {
      setIsCompact(true);
    }
  }, []);

  // Fetch files and history once authenticated
  useEffect(() => {
    if (token) {
      fetchFilesList();
      fetchQueryHistory(activeFile?.id);
    }
  }, [token]);

  // Fetch dynamic suggestions when active file changes
  useEffect(() => {
    if (activeFile && token) {
      fetch(`${API_BASE}/files/${activeFile.id}/suggestions`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401) {
            handleSignOut();
            alert("Session expired. You logged in from another device.");
            throw new Error("Session expired");
          }
          return res.ok ? res.json() : { suggestions: [] };
        })
        .then(data => setDynamicSuggestions(data.suggestions))
        .catch(() => setDynamicSuggestions([]));
        
      fetchQueryHistory(activeFile.id);
    } else if (!activeFile && token) {
      fetchQueryHistory();
    }
  }, [activeFile, token, API_BASE]);

  // Scroll to bottom of chat when messages change or loading state changes
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, [chatThreads, activeFile, isQuerying]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem(`hm_theme_${userId}`, newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleCompactToggle = () => {
    const newVal = !isCompact;
    setIsCompact(newVal);
    localStorage.setItem(`hm_compact_${userId}`, String(newVal));
  };

  // --- Auth Handlers ---

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthError(null);
    setAuthLoading(true);

    const endpoint = isRegisterMode ? "/auth/register" : "/auth/login";

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication request failed.");
      }

      const result = await response.json();
      localStorage.setItem("hm_token", result.access_token);
      localStorage.setItem("hm_email", result.email);
      localStorage.setItem("hm_userid", result.user_id);

      setToken(result.access_token);
      setEmail(result.email);
      setUserId(result.user_id);

      const hasOnboarded = localStorage.getItem(`hm_onboarding_completed_${result.user_id}`) || localStorage.getItem("hm_onboarding_completed");
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
      
      const savedTheme = localStorage.getItem(`hm_theme_${result.user_id}`);
      if (savedTheme) {
        setTheme(savedTheme as any);
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }

      const savedCompact = localStorage.getItem(`hm_compact_${result.user_id}`);
      setIsCompact(savedCompact === 'true');

      setAuthPassword("");
      setAuthEmail("");
    } catch (err: any) {
      setAuthError(err.message || "Connection timed out.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_email");
    localStorage.removeItem("hm_userid");
    setToken(null);
    setEmail("");
    setUserId("");
    setFiles([]);
    setActiveFile(null);
    setChatThreads({});
    setQueryHistory([]);
    document.documentElement.classList.remove('dark');
    setTheme('light');
  };

  const checkAuthResponse = (res: Response) => {
    if (res.status === 401) {
      handleSignOut();
      alert("Session expired. You logged in from another device.");
      return false;
    }
    return true;
  };

  const fetchFilesList = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/files`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!checkAuthResponse(response)) return;
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        if (data.length > 0 && !activeFile) {
          // Default to the first available file (often the seeded e-commerce one)
          setActiveFile(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load files list", err);
    }
  };

  const fetchQueryHistory = async (fileId?: string) => {
    if (!token) return;
    try {
      const url = fileId ? `${API_BASE}/history?file_id=${fileId}` : `${API_BASE}/history`;
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!checkAuthResponse(response)) return;
      if (response.ok) {
        const data = await response.json();
        setQueryHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch query history", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !token) return;
    const selectedFile = e.target.files[0];

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!checkAuthResponse(response)) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "File structure rejected by ingestion pipeline.");
      }

      const result = await response.json();
      await fetchFilesList();

      // Auto switch to dashboard and set active
      const newFileItem: FileItem = {
        id: result.file_id,
        file_name: selectedFile.name,
        table_name: `data_${result.file_id}`,
        row_count: result.rows_ingested,
        columns: result.columns_discovered,
        uploaded_at: new Date().toISOString()
      };
      setActiveFile(newFileItem);
      setActiveTab('catalog');
    } catch (err: any) {
      setUploadError(err.message || "Failed to process CSV file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !window.confirm("Are you sure you want to delete this dataset? All history and configurations will be permanently removed.")) return;

    try {
      const response = await fetch(`${API_BASE}/files/${fileId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!checkAuthResponse(response)) return;

      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        if (activeFile?.id === fileId) {
          setActiveFile(null);
        }
        if (previewFileItem?.id === fileId) {
          setPreviewFileItem(null);
        }
        if (profilingFileItem?.id === fileId) {
          setProfilingFileItem(null);
        }
        fetchQueryHistory();
      }
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const handlePreviewFile = async (fileItem: FileItem) => {
    setPreviewFileItem(fileItem);
    setPreviewRows([]);
    setPreviewLoading(true);

    try {
      const response = await fetch(`${API_BASE}/files/${fileItem.id}/preview`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!checkAuthResponse(response)) return;
      if (response.ok) {
        const result = await response.json();
        setPreviewRows(result.preview_data);
      }
    } catch (err) {
      console.error("Failed to preview file", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleProfileFile = async (fileItem: FileItem) => {
    setProfilingFileItem(fileItem);
    setColumnProfiles([]);
    setProfilingLoading(true);

    try {
      const response = await fetch(`${API_BASE}/files/${fileItem.id}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!checkAuthResponse(response)) return;
      if (response.ok) {
        const result = await response.json();
        setColumnProfiles(result);
      }
    } catch (err) {
      console.error("Failed to profile file", err);
    } finally {
      setProfilingLoading(false);
    }
  };

  const handleReSeedData = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: "dummy" }) // trigger seeding hook
      });
      await fetchFilesList();
      alert("Sample sales data successfully restored.");
    } catch (err) {
      console.error("Seeding request ignored as user exists.");
      // If seeding ignored, we've already done it, or we can just fetch
      await fetchFilesList();
    }
  };
  
  const handleDismissOnboarding = () => {
    if (userId) {
      localStorage.setItem(`hm_onboarding_completed_${userId}`, "true");
    } else {
      localStorage.setItem("hm_onboarding_completed", "true");
    }
    setShowOnboarding(false);
  };

  // --- NL-to-SQL Execution Pipeline Handlers ---

  const handleSendQuery = async (queryText: string, mode: string = 'nl') => {
    if (!queryText.trim() || !activeFile || !token) return;

    const currentFileId = activeFile.id;
    const userQuery = queryText;

    // Optimistically update chat threads UI
    const newUserMessage: ChatMessage = { role: 'user', content: userQuery };
    const currentThread = chatThreads[currentFileId] || [];
    setChatThreads({
      ...chatThreads,
      [currentFileId]: [...currentThread, newUserMessage]
    });

    setNlQuery("");
    setIsQuerying(true);
    setQueryError(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          file_id: currentFileId,
          natural_language_query: userQuery,
          query_mode: mode,
          ai_model: selectedAiModel
        }),
        signal: controller.signal
      });

      if (!checkAuthResponse(response)) return;

      const updatedThread = [...(chatThreads[currentFileId] || []), newUserMessage];

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.detail || "Tabular query compiler encountered an execution fault.";

        setChatThreads({
          ...chatThreads,
          [currentFileId]: [...updatedThread, {
            role: 'model',
            content: `Error: ${errorMsg}`,
            explanation: errorMsg,
            isError: true
          }]
        });
        throw new Error(errorMsg);
      }

      const result = await response.json();

      const newModelMessage: ChatMessage = {
        role: 'model',
        content: result.explanation,
        sql_query: result.sql_query,
        explanation: result.explanation,
        data: result.data,
        visualization_config: result.visualization_config,
        source_file: result.source_file
      };

      setChatThreads({
        ...chatThreads,
        [currentFileId]: [...updatedThread, newModelMessage]
      });

      // Update history catalog
      fetchQueryHistory(activeFile?.id);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setQueryError(err.message || "Server connection lost.");
    } finally {
      setIsQuerying(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelQuery = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsQuerying(false);
      if (activeFile) {
        const currentThread = chatThreads[activeFile.id] || [];
        setChatThreads({
          ...chatThreads,
          [activeFile.id]: [
            ...currentThread,
            {
              role: 'model',
              content: "Query compilation process aborted by user.",
              explanation: "Execution cancelled.",
              isError: true
            }
          ]
        });
      }
    }
  };

  const handleReloadHistoryItem = async (hist: any) => {
    const matchedFile = files.find(f => f.id === hist.file_id);
    if (!matchedFile) return;

    if (!activeFile || activeFile.id !== hist.file_id) {
      setActiveFile(matchedFile);
    }

    const currentFileId = hist.file_id;
    const userQuery = hist.question;
    const sqlToRun = hist.sql_query;

    const tempModelMsg: ChatMessage = {
      role: 'model',
      content: "Reloading analytical results from database sandbox...",
      sql_query: sqlToRun,
      explanation: "Running query...",
      isLoading: true
    };

    const currentThread = chatThreads[currentFileId] || [];
    setChatThreads({
      ...chatThreads,
      [currentFileId]: [...currentThread, { role: 'user', content: userQuery }, tempModelMsg]
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          file_id: currentFileId,
          natural_language_query: sqlToRun,
          ai_model: selectedAiModel
        })
      });

      if (!checkAuthResponse(response)) return;

      if (!response.ok) {
        throw new Error("Failed to reload data");
      }

      const result = await response.json();
      
      const finalModelMsg: ChatMessage = {
        role: 'model',
        content: hist.explanation,
        sql_query: sqlToRun,
        explanation: hist.explanation,
        data: result.data,
        visualization_config: result.visualization_config || hist.visualization_config,
        source_file: matchedFile.file_name
      };

      setChatThreads(prev => ({
        ...prev,
        [currentFileId]: [
          ...(prev[currentFileId] || []).slice(0, -1),
          finalModelMsg
        ]
      }));
    } catch (err) {
      const finalModelMsg: ChatMessage = {
        role: 'model',
        content: hist.explanation,
        sql_query: sqlToRun,
        explanation: hist.explanation,
        data: [],
        visualization_config: hist.visualization_config,
        source_file: matchedFile.file_name
      };
      setChatThreads(prev => ({
        ...prev,
        [currentFileId]: [
          ...(prev[currentFileId] || []).slice(0, -1),
          finalModelMsg
        ]
      }));
    }
  };

  const handleClearHistory = async () => {
    if (!activeFile || !token) return;
    try {
      const response = await fetch(`${API_BASE}/chat/${activeFile.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!checkAuthResponse(response)) return;
      if (response.ok) {
        setChatThreads({
          ...chatThreads,
          [activeFile.id]: []
        });
      }
    } catch (err) {
      console.error("Failed to reset chat memory", err);
    }
  };




  // --- Auth Wall Render ---

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-x-hidden overflow-y-auto">


        {/* Inner layout container for better sizing */}
        <div className="w-full max-w-md my-8 space-y-6 relative z-10 flex flex-col items-center">

          {/* Main Auth Card Container */}
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">

            {/* Header Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex bg-indigo-50 text-indigo-600 p-3 rounded-2xl border border-indigo-100 shadow-sm">
                <Database className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800">
                  HyperMindZ Analytics
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Natural Language Tabular Query Console
                </p>
              </div>
            </div>

            {/* Sliding Toggle between Sign In and Create Account */}
            <div className="relative grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isRegisterMode ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                  }`}
              />
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setAuthError(null);
                }}
                className={`relative z-10 py-2 text-xs font-bold rounded-lg transition-colors duration-200 ${!isRegisterMode ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setAuthError(null);
                }}
                className={`relative z-10 py-2 text-xs font-bold rounded-lg transition-colors duration-200 ${isRegisterMode ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Context Explainer Header */}
            <div className="text-center px-2">
              <p className="text-xs text-slate-500 font-medium">
                {!isRegisterMode
                  ? "Enter your credentials to access your isolated data sandbox."
                  : "Register a secure account to load datasets and get SQL insights."
                }
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleAuth} className="space-y-5">
              {authError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-start space-x-2 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. analyst or admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm placeholder:text-slate-400 font-medium text-slate-800 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="pass" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm placeholder:text-slate-400 font-medium text-slate-800 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={authLoading || !authEmail || !authPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm flex items-center justify-center space-x-2 mt-4"
              >
                {authLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Loading session...</span>
                  </div>
                ) : (
                  <span>{!isRegisterMode ? "Authenticate Terminal" : "Create Account & Seed"}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Dashboard Console Render ---

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        email={email}
        handleSignOut={handleSignOut}
        setShowOnboarding={setShowOnboarding}
      />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {activeTab !== 'playground' && (
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-800 capitalize tracking-wide flex items-center gap-1.5">
                <span>HyperMindZ Console</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-semibold">{activeTab}</span>
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${theme === 'light' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${theme === 'dark' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${theme === 'system' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  System
                </button>
              </div>
              
              {/* Quick Help Button */}
              <button
                onClick={() => setShowOnboarding(true)}
                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors border border-slate-200 bg-slate-50 shadow-sm"
                title="Open User Guide"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </header>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className={`${isCompact ? 'p-4' : 'p-4 sm:p-8'} max-w-5xl space-y-6 flex-1`}>
            <h1 className="text-2xl font-black text-slate-800">Workspace Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Welcome back! Here is an overview of your data sandboxes.</p>

            {/* Sleek User Guide Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 z-10">
                <h3 className="text-base font-bold flex items-center gap-2"><Sparkles className="h-5 w-5" /> Quick Guide: Dashboard</h3>
                <p className="text-xs text-indigo-100 font-medium max-w-xl">Monitor your workspace metrics at a glance. Select active datasets to start running AI queries instantly, or manage your catalog from the sidebar.</p>
              </div>
              <button onClick={() => setShowOnboarding(true)} className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 transition-all shadow-sm z-10 shrink-0 w-full md:w-auto text-center">
                Launch Full Guide
              </button>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Datasets</span>
                  <span className="text-2xl font-black text-indigo-600">{files.length}</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-500">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Rows</span>
                  <span className="text-2xl font-black text-emerald-500">{files.reduce((acc, f) => acc + f.row_count, 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="bg-amber-50 p-3 rounded-xl text-amber-500">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saved Queries</span>
                  <span className="text-2xl font-black text-amber-500">{queryHistory.length}</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="bg-rose-50 p-3 rounded-xl text-rose-500">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Status</span>
                  <span className="text-sm font-black text-rose-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span>
                    100% Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Chart Column 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-indigo-600" /> Catalog Dataset Row Distribution
                </h3>
                <div className="w-full h-64 font-medium text-[10px] text-slate-500">
                  {files.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400">No data catalog loaded. Upload a CSV to display.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={files.map(f => ({ name: f.file_name.substring(0, 12), rows: f.row_count }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                        <YAxis stroke="#94a3b8" tickLine={false} />
                        <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                        <Bar dataKey="rows" name="Row Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart Column 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <History className="h-4 w-4 text-emerald-600" /> Analytical Query Traffic & SQL Lengths
                </h3>
                <div className="w-full h-64 font-medium text-[10px] text-slate-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart 
                      data={queryHistory.length > 0 
                        ? queryHistory.slice(-6).map((q, idx) => ({ index: `Q${idx + 1}`, chars: q.question.length, sql: q.sql_query.length }))
                        : [
                            { index: 'Mon', chars: 45, sql: 85 },
                            { index: 'Tue', chars: 50, sql: 95 },
                            { index: 'Wed', chars: 35, sql: 75 },
                            { index: 'Thu', chars: 65, sql: 110 },
                            { index: 'Fri', chars: 40, sql: 90 },
                            { index: 'Sat', chars: 15, sql: 40 }
                          ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorChars" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSql" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" stroke="#94a3b8" tickLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} />
                      <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="chars" name="Question Length" stroke="#10b981" fillOpacity={1} fill="url(#colorChars)" />
                      <Area type="monotone" dataKey="sql" name="SQL Length" stroke="#6366f1" fillOpacity={1} fill="url(#colorSql)" />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Registered Datasets log table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-indigo-500" /> Recent Session Database Registry
                </h3>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">SECURE SANDBOX</span>
              </div>
              
              {files.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">No registered datasets in this session. Go to Catalog to upload.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                        <th className="px-6 py-3">Dataset Name</th>
                        <th className="px-6 py-3">Physical Schema ID</th>
                        <th className="px-6 py-3 text-right">Ingest Rows</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {files.slice(0, 3).map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-3 font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {file.file_name}
                          </td>
                          <td className="px-6 py-3 font-mono text-[10px] text-slate-400">{file.table_name}</td>
                          <td className="px-6 py-3 text-right text-slate-600 font-bold">{file.row_count.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              <h2 className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Quick Actions</h2>
              <div className="flex space-x-4 mt-4">
                <button onClick={() => setActiveTab('catalog')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-500">Upload New Dataset</button>
                <button onClick={() => setActiveTab('playground')} className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-50">Open AI Terminal</button>
                <button onClick={() => setShowOnboarding(true)} className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  View User Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PlayGround Tab */}
        {activeTab === 'playground' && activeFile && (
          <Playground
            activeFile={activeFile}
            chatThreads={chatThreads}
            setChatThreads={setChatThreads}
            isQuerying={isQuerying}
            nlQuery={nlQuery}
            setNlQuery={setNlQuery}
            dynamicSuggestions={dynamicSuggestions}
            handleSendQuery={handleSendQuery}
            handleClearHistory={handleClearHistory}
            queryHistory={queryHistory}
            files={files}
            setActiveFile={setActiveFile}
            selectedChartOverride={selectedChartOverride}
            setSelectedChartOverride={setSelectedChartOverride}
            setActiveTab={setActiveTab}
            chatEndRef={chatEndRef}
            theme={theme}
            handleThemeChange={handleThemeChange}
            setShowOnboarding={setShowOnboarding}
            handleFileUpload={handleFileUpload}
            isUploading={isUploading}
            onCancelQuery={handleCancelQuery}
            onReloadHistoryItem={handleReloadHistoryItem}
            selectedAiModel={selectedAiModel}
            setSelectedAiModel={setSelectedAiModel}
          />
        )}

        {/* Data Catalog Tab */}
        {activeTab === 'catalog' && (
          <DataCatalog
            files={files}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            setActiveTab={setActiveTab}
            handlePreviewFile={handlePreviewFile}
            handleProfileFile={handleProfileFile}
            handleDeleteFile={handleDeleteFile}
            previewFileItem={previewFileItem}
            setPreviewFileItem={setPreviewFileItem}
            previewLoading={previewLoading}
            previewRows={previewRows}
            profilingFileItem={profilingFileItem}
            setProfilingFileItem={setProfilingFileItem}
            profilingLoading={profilingLoading}
            columnProfiles={columnProfiles}
            isUploading={isUploading}
            uploadError={uploadError}
            handleFileUpload={handleFileUpload}
            setShowOnboarding={setShowOnboarding}
            onPrefillQuery={(query) => {
              setNlQuery(query);
              setActiveTab('playground');
            }}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab
            isCompact={isCompact}
            theme={theme}
            handleThemeChange={handleThemeChange}
            handleCompactToggle={handleCompactToggle}
            handleReSeedData={handleReSeedData}
            handleSignOut={handleSignOut}
            setShowOnboarding={setShowOnboarding}
          />
        )}

      </main>
      
      {showOnboarding && <OnboardingModal onDismiss={handleDismissOnboarding} />}
    </div>
  );
}