"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Play, Database, Table, BarChart3, AlertCircle,
  FileSpreadsheet, Trash2, Eye, Settings, LogOut, User,
  History, Sparkles, MessageSquare, ChevronRight, RefreshCw,
  Plus, Check, HelpCircle, LineChart, PieChart, AreaChart, BarChart,
  Mail, Lock, EyeOff, Globe, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart as RechartsBarChart, Bar,
  LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart,
  Pie, Cell, XAxis, YAxis, Tooltip, Legend, AreaChart as RechartsAreaChart,
  Area, ScatterChart as RechartsScatterChart, Scatter
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
  const [selectedChartOverride, setSelectedChartOverride] = useState<{ [msgIndex: number]: string }>({});
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [groqApiKey, setGroqApiKey] = useState("");

  const [dynamicSuggestions, setDynamicSuggestions] = useState<{ text: string; category: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Auth Token from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("hm_token");
    const savedEmail = localStorage.getItem("hm_email");
    const savedUserId = localStorage.getItem("hm_userid");
    const savedKey = localStorage.getItem("hm_groq_key");
    const savedApiBase = localStorage.getItem("hm_api_base");

    if (savedToken && savedEmail && savedUserId) {
      setToken(savedToken);
      setEmail(savedEmail);
      setUserId(savedUserId);
    }
    if (savedKey) {
      setGroqApiKey(savedKey);
    }
    if (savedApiBase) {
      setApiBaseUrl(savedApiBase);
    }

    const savedTheme = localStorage.getItem("hm_theme") as any;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }

    const savedCompact = localStorage.getItem("hm_compact");
    if (savedCompact === 'true') {
      setIsCompact(true);
    }
  }, []);

  // Fetch files and history once authenticated
  useEffect(() => {
    if (token) {
      fetchFilesList();
      fetchQueryHistory();
    }
  }, [token]);

  // Fetch dynamic suggestions when active file changes
  useEffect(() => {
    if (activeFile && token) {
      fetch(`${API_BASE}/files/${activeFile.id}/suggestions`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : { suggestions: [] })
        .then(data => setDynamicSuggestions(data.suggestions))
        .catch(() => setDynamicSuggestions([]));
    }
  }, [activeFile, token, API_BASE]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatThreads, activeFile]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem("hm_theme", newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleCompactToggle = () => {
    const newVal = !isCompact;
    setIsCompact(newVal);
    localStorage.setItem("hm_compact", String(newVal));
  };

  // --- Auth Handlers ---

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    if (!authEmail.includes("@")) {
      setAuthError("Username must be a valid email address.");
      return;
    }

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
  };

  const fetchFilesList = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/files`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
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

  const fetchQueryHistory = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
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

  const handleSaveApiKey = (key: string) => {
    setGroqApiKey(key);
    if (key.trim()) {
      localStorage.setItem("hm_groq_key", key);
    } else {
      localStorage.removeItem("hm_groq_key");
    }
  };

  // --- NL-to-SQL Execution Pipeline Handlers ---

  const handleSendQuery = async (queryText: string) => {
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

    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    if (groqApiKey.trim()) {
      headers["X-Groq-Key"] = groqApiKey.trim();
    }

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          file_id: currentFileId,
          natural_language_query: userQuery
        })
      });

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
      fetchQueryHistory();
    } catch (err: any) {
      setQueryError(err.message || "Server connection lost.");
    } finally {
      setIsQuerying(false);
    }
  };

  const handleClearHistory = async () => {
    if (!activeFile || !token) return;
    try {
      const response = await fetch(`${API_BASE}/chat/${activeFile.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
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



  // Renders the Recharts visualization based on configs
  const renderMessageChart = (msg: ChatMessage, msgIndex: number) => {
    if (!msg.data || msg.data.length === 0 || !msg.visualization_config) return null;

    const recommendedType = msg.visualization_config.type;
    const activeChartType = selectedChartOverride[msgIndex] || recommendedType;

    const xKey = msg.visualization_config.x_axis_key || "";
    const yKey = msg.visualization_config.y_axis_key || "";

    if (activeChartType === 'none' || !xKey || !yKey) return null;

    // Check if keys exist in data keys
    const firstRowKeys = Object.keys(msg.data[0]);
    const xKeyExists = firstRowKeys.some(k => k.toLowerCase() === xKey.toLowerCase());
    const yKeyExists = firstRowKeys.some(k => k.toLowerCase() === yKey.toLowerCase());

    const actualXKey = xKeyExists ? firstRowKeys.find(k => k.toLowerCase() === xKey.toLowerCase())! : xKey;
    const actualYKey = yKeyExists ? firstRowKeys.find(k => k.toLowerCase() === yKey.toLowerCase())! : yKey;

    const formattedData = msg.data.map(row => {
      const copy = { ...row };
      if (typeof copy[actualYKey] === 'string') {
        const parsed = parseFloat(copy[actualYKey].replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsed)) copy[actualYKey] = parsed;
      }
      return copy;
    });

    return (
      <div className="mt-4 p-4 bg-white border border-slate-100 rounded-xl shadow-inner-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-indigo-600" /> Visualization
          </span>

          {/* Manual Chart Switcher Override */}
          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100">
            {['bar', 'line', 'area', 'pie'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedChartOverride({ ...selectedChartOverride, [msgIndex]: type })}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md capitalize transition-all ${activeChartType === type
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => setSelectedChartOverride({ ...selectedChartOverride, [msgIndex]: 'none' })}
              className="text-[10px] font-semibold px-2 py-1 rounded-md text-slate-400 hover:text-rose-600 transition-all"
            >
              Hide
            </button>
          </div>
        </div>

        <div className="w-full h-64 pt-2 font-medium text-[10px] text-slate-500">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartType === 'bar' ? (
              <RechartsBarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey={actualXKey} stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '5px' }} />
                <Bar dataKey={actualYKey} name={actualYKey.replace(/_/g, ' ')} fill="#6366f1" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            ) : activeChartType === 'line' ? (
              <RechartsLineChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey={actualXKey} stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '5px' }} />
                <Line type="monotone" dataKey={actualYKey} name={actualYKey.replace(/_/g, ' ')} stroke="#6366f1" strokeWidth={2} activeDot={{ r: 5 }} />
              </RechartsLineChart>
            ) : activeChartType === 'area' ? (
              <RechartsAreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey={actualXKey} stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '5px' }} />
                <Area type="monotone" dataKey={actualYKey} name={actualYKey.replace(/_/g, ' ')} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPv)" />
              </RechartsAreaChart>
            ) : activeChartType === 'pie' ? (
              <RechartsPieChart>
                <Pie
                  data={formattedData}
                  dataKey={actualYKey}
                  nameKey={actualXKey}
                  cx="50%" cy="45%" outerRadius={70} labelLine={false} label={({ name, percent }) => `${(name || '').substring(0, 10)}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
              </RechartsPieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">Visualization override failed: Data format mismatch.</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // --- Auth Wall Render ---

  const isPasswordValid = authPassword.length >= 1;

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-x-hidden overflow-y-auto">
        {/* Decorative background blur shapes */}
        <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>

        {/* Inner layout container for better sizing */}
        <div className="w-full max-w-xl my-8 space-y-6 relative z-10 flex flex-col items-center">

          {/* Main Auth Card Container */}
          <div className="w-full bg-slate-900/70 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">

            {/* Header Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-2xl border border-indigo-400/20 shadow-lg shadow-indigo-500/15">
                <Database className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  HyperMindZ Analytics
                </h1>
                <p className="text-xs font-semibold text-indigo-400 mt-1">
                  Natural Language Tabular Query Console
                </p>
              </div>
            </div>

            {/* Sliding Toggle between Sign In and Create Account */}
            <div className="relative grid grid-cols-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-800 rounded-lg shadow-md transition-all duration-300 ease-out ${isRegisterMode ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                  }`}
              />
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setAuthError(null);
                }}
                className={`relative z-10 py-2 text-xs font-bold rounded-lg transition-colors duration-200 ${!isRegisterMode ? "text-white" : "text-slate-400 hover:text-slate-200"
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
                className={`relative z-10 py-2 text-xs font-bold rounded-lg transition-colors duration-200 ${isRegisterMode ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Context Explainer Header */}
            <div className="text-center px-2">
              <p className="text-xs text-slate-400 font-medium">
                {!isRegisterMode
                  ? "Enter your credentials to access your isolated data sandbox."
                  : "Register a secure account to load datasets and get SQL insights."
                }
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleAuth} className="space-y-4">
              {authError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-start space-x-2 text-xs font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm placeholder:text-slate-700 font-medium text-white transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="pass" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-800 bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm placeholder:text-slate-700 font-medium text-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={authLoading || !authEmail || !authPassword}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center space-x-2 cursor-pointer mt-2"
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex select-none">
      {/* Sidebar Navigation */}
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

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className={`${isCompact ? 'p-4' : 'p-8'} max-w-5xl space-y-6 flex-1`}>
            <h1 className="text-2xl font-black text-slate-800">Workspace Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Welcome back! Here is an overview of your data sandboxes.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Datasets</span>
                <span className="text-4xl font-black text-indigo-600">{files.length}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rows Indexed</span>
                <span className="text-4xl font-black text-emerald-500">{files.reduce((acc, f) => acc + f.row_count, 0).toLocaleString()}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Queries</span>
                <span className="text-4xl font-black text-amber-500">{queryHistory.length}</span>
              </div>
            </div>

            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Quick Actions</h2>
              <div className="flex space-x-4 mt-4">
                <button onClick={() => setActiveTab('catalog')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-500">Upload New Dataset</button>
                <button onClick={() => setActiveTab('playground')} className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-50">Open AI Terminal</button>
              </div>
            </div>
          </div>
        )}

        {/* PlayGround Tab */}
        {activeTab === 'playground' && (
          <div className="flex-1 flex min-h-0 bg-slate-50">
            {/* Chat Conversation Thread Section */}
            <div className="flex-1 flex flex-col border-r border-slate-200 max-h-screen">

              {/* Playground Header */}
              <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Scope:</span>
                  {activeFile ? (
                    <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold text-indigo-700">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>{activeFile.file_name}</span>
                      <span className="text-[10px] text-indigo-500 bg-white px-1.5 py-0.5 rounded-full border border-indigo-100">{activeFile.row_count} rows</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-500">No active dataset. Go to Data Catalog.</span>
                  )}
                </div>

                {activeFile && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                    title="Clear chat context memory"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset Chat Context
                  </button>
                )}
              </header>

              {/* Chat Speech Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!activeFile ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-slate-200/50 p-4 rounded-3xl text-slate-400">
                      <FileSpreadsheet className="h-10 w-10 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700">Analytics Sandbox Ready</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">Please select or upload a CSV dataset from the Data Catalog tab to begin exploring.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/10"
                    >
                      Open Data Catalog
                    </button>
                  </div>
                ) : (chatThreads[activeFile.id] || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-500 border border-indigo-100">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Explore {activeFile.file_name}</h3>
                      <p className="text-xs text-slate-400 max-w-md mt-1">Ask questions in plain English. The AI engine will translate them into secure SQL queries and render tables, charts, or text insights.</p>
                    </div>
                  </div>
                ) : (
                  (chatThreads[activeFile.id] || []).map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl space-y-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md' : ''}`}>

                        {/* User Chat Bubble */}
                        {msg.role === 'user' && (
                          <p className="text-xs font-semibold leading-relaxed">{msg.content}</p>
                        )}

                        {/* Model Insight Box */}
                        {msg.role === 'model' && (
                          <div className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-slate-800 ${msg.isError ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200'}`}>

                            {/* Attributed Source File */}
                            {msg.source_file && (
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                                <Database className="h-3 w-3 text-indigo-500" /> Source: {msg.source_file}
                              </div>
                            )}

                            {/* Response content description */}
                            <div className="flex items-start space-x-3">
                              {msg.isError ? (
                                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                              ) : (
                                <Database className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                              )}
                              <p className="text-xs font-medium text-slate-600 leading-relaxed">{msg.content}</p>
                            </div>

                            {/* SQL query code viewer */}
                            {msg.sql_query && (
                              <div className="space-y-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                                <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
                                  <span className="font-mono">SQLITE QUERY</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.sql_query || "");
                                      alert("SQL copied to clipboard!");
                                    }}
                                    className="hover:text-white transition-all"
                                  >
                                    Copy Code
                                  </button>
                                </div>
                                <pre className="p-4 text-[10px] font-semibold font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                                  {msg.sql_query}
                                </pre>
                              </div>
                            )}

                            {/* Chart render section */}
                            {msg.visualization_config?.recommended && renderMessageChart(msg, index)}

                            {/* Response Data Table Grid */}
                            {msg.data && msg.data.length > 0 && (
                              <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 p-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Table className="h-3.5 w-3.5 text-indigo-600" /> Result Dataset ({msg.data.length} rows)
                                </span>
                                <div className="overflow-x-auto border border-slate-100 rounded-lg max-h-60 bg-white">
                                  <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                        {Object.keys(msg.data[0]).map((header) => (
                                          <th key={header} className="px-3 py-2.5 capitalize truncate">{header.replace(/_/g, ' ')}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                      {msg.data.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                          {Object.values(row).map((val: any, cIdx) => (
                                            <td key={cIdx} className="px-3 py-2 font-medium">
                                              {val === null || val === undefined
                                                ? <span className="text-slate-300">null</span>
                                                : typeof val === 'number'
                                                  ? val.toLocaleString()
                                                  : String(val)
                                              }
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {msg.data && msg.data.length === 0 && !msg.isError && (
                              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-slate-100 font-medium">
                                This analytical query returned zero rows.
                              </p>
                            )}

                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Query loading skeleton */}
                {isQuerying && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 w-full max-w-xl animate-pulse">
                      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                        <div className="h-3 w-28 bg-slate-200 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-200 rounded"></div>
                        <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                      </div>
                      <div className="h-20 bg-slate-900/5 rounded-xl border border-slate-200/50"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Console Form */}
              {activeFile && (
                <div className="p-6 bg-white border-t border-slate-200 space-y-4">
                  {/* Suggested questions box */}
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {dynamicSuggestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendQuery(q.text)}
                          disabled={isQuerying}
                          className="bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 text-[10px] font-bold text-indigo-600 px-2.5 py-1 rounded-full transition-all"
                        >
                          {q.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendQuery(nlQuery);
                    }}
                    className="flex gap-3"
                  >
                    <input
                      type="text"
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      placeholder="e.g. 'What is the sum of revenue for Q1 by region?'"
                      disabled={isQuerying}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50/50 text-xs placeholder:text-slate-400 font-semibold"
                    />
                    <button
                      type="submit"
                      disabled={isQuerying || !nlQuery.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 text-xs shadow-md shadow-indigo-600/10"
                    >
                      {isQuerying ? "Compiling..." : <><span>Run Query</span><Play className="h-3.5 w-3.5 fill-current" /></>}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Playground Right Side Execution Logs Panel */}
            <div className="w-80 flex flex-col bg-white overflow-y-auto max-h-screen">
              <div className="p-6 border-b border-slate-200 flex items-center space-x-2 shadow-sm">
                <History className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Execution Logs</h3>
              </div>

              <div className="p-4 divide-y divide-slate-100">
                {queryHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-8">No queries executed yet.</p>
                ) : (
                  queryHistory.map((hist, hIdx) => (
                    <button
                      key={hIdx}
                      onClick={() => {
                        // Optimistically re-add to chat conversation panel
                        if (activeFile && hist.file_id === activeFile.id) {
                          const currentThread = chatThreads[activeFile.id] || [];
                          setChatThreads({
                            ...chatThreads,
                            [activeFile.id]: [
                              ...currentThread,
                              { role: 'user', content: hist.question },
                              {
                                role: 'model',
                                content: hist.explanation,
                                sql_query: hist.sql_query,
                                explanation: hist.explanation,
                                data: [], // we skip data records reload for memory footprint
                                visualization_config: hist.visualization_config,
                                source_file: activeFile.file_name
                              }
                            ]
                          });
                        } else {
                          // Change active file first if different
                          const matchedFile = files.find(f => f.id === hist.file_id);
                          if (matchedFile) {
                            setActiveFile(matchedFile);
                            setChatThreads({
                              ...chatThreads,
                              [hist.file_id]: [
                                ...(chatThreads[hist.file_id] || []),
                                { role: 'user', content: hist.question },
                                {
                                  role: 'model',
                                  content: hist.explanation,
                                  sql_query: hist.sql_query,
                                  explanation: hist.explanation,
                                  data: [],
                                  visualization_config: hist.visualization_config,
                                  source_file: matchedFile.file_name
                                }
                              ]
                            });
                          }
                        }
                      }}
                      className="w-full text-left py-3.5 hover:bg-slate-50 px-2 rounded-xl transition-all group flex items-start space-x-2 text-xs font-medium"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 shrink-0 mt-0.5 transition-colors" />
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-slate-700 font-bold leading-relaxed truncate">{hist.question}</p>
                        <code className="text-[10px] text-emerald-600 font-mono block truncate">{hist.sql_query}</code>
                        <span className="text-[9px] text-slate-400 block font-semibold">{new Date(hist.executed_at).toLocaleString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Data Catalog Tab */}
        {activeTab === 'catalog' && (
          <div className="p-8 space-y-8 flex-1">

            {/* File Dropzone Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-600" /> Data Source Ingestion Sandbox
              </h2>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-8 cursor-pointer bg-slate-50/50 transition-colors group">
                  <Upload className="h-10 w-10 text-slate-400 group-hover:text-indigo-600 mb-3 transition-colors" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {isUploading ? "Registering schema and saving..." : "Select or Drop CSV Dataset"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">Accepts tabular schemas up to 10MB / 100K rows</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                </label>

                <div className="space-y-4">
                  {uploadError && (
                    <div className="p-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 flex items-start space-x-3 text-xs font-semibold">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <p>{uploadError}</p>
                    </div>
                  )}
                  {!uploadError && (
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Upload any system CSV file. The analytics engine will automatically discover column schema formatting, normalize headings, spin up a dedicated SQLite database, and configure isolated read-only execute boundaries for your user session.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Catalog Files List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-indigo-600" /> Registered Datasets Catalog ({files.length})
                </h2>
              </div>

              {files.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">
                  No datasets currently registered. Upload a CSV file above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                        <th className="px-6 py-4">Filename</th>
                        <th className="px-6 py-4">Database Table</th>
                        <th className="px-6 py-4">Record Size</th>
                        <th className="px-6 py-4">Uploaded At</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {files.map((file) => (
                        <tr
                          key={file.id}
                          onClick={() => {
                            setActiveFile(file);
                            setActiveTab('dashboard');
                          }}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${activeFile?.id === file.id ? 'bg-indigo-50/20' : ''}`}
                        >
                          <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-indigo-500 shrink-0" />
                            <span>{file.file_name}</span>
                            {activeFile?.id === file.id && (
                              <span className="bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{file.table_name}</td>
                          <td className="px-6 py-4 font-semibold text-slate-600">{file.row_count.toLocaleString()} rows</td>
                          <td className="px-6 py-4 text-slate-400">{new Date(file.uploaded_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex space-x-1">
                              <button
                                onClick={() => {
                                  setActiveFile(file);
                                  setActiveTab('dashboard');
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold flex items-center gap-1 hover:text-indigo-800"
                                title="Open in Terminal Playground"
                              >
                                Query
                              </button>
                              <button
                                onClick={() => handlePreviewFile(file)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Quick Preview Rows"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleProfileFile(file)}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Data Schema & Insights Profile"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteFile(file.id, e)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Dataset"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Preview Table Draw Mode */}
            {previewFileItem && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Eye className="h-4.5 w-4.5 text-indigo-500" /> Data Preview: {previewFileItem.file_name} (First 20 rows)
                  </h3>
                  <button
                    onClick={() => setPreviewFileItem(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Close Preview
                  </button>
                </div>

                {previewLoading ? (
                  <div className="py-8 text-center text-slate-400 animate-pulse font-semibold">Loading data matrix preview...</div>
                ) : previewRows.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 font-medium">Empty preview results.</div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-96">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                          {Object.keys(previewRows[0]).map((h) => (
                            <th key={h} className="px-3.5 py-3 capitalize truncate">{h.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {previewRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2.5 font-medium">
                                {val === null ? <span className="text-slate-300">null</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Column Profiling Summary Statistics Draw Mode */}
            {profilingFileItem && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-4.5 w-4.5 text-indigo-500" /> Data Profiling Summary: {profilingFileItem.file_name}
                  </h3>
                  <button
                    onClick={() => setProfilingFileItem(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Close Profiler
                  </button>
                </div>

                {profilingLoading ? (
                  <div className="py-8 text-center text-slate-400 animate-pulse font-semibold">Generating column statistical summary...</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {columnProfiles.map((col, cIdx) => (
                      <div key={cIdx} className="border border-slate-150 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{col.name}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${col.type === 'numeric' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>{col.type}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-1 text-[10px] text-slate-500 font-semibold">
                            <div>Valid: <span className="text-slate-800">{col.count.toLocaleString()}</span></div>
                            <div>Unique: <span className="text-slate-800">{col.unique_count.toLocaleString()}</span></div>
                            <div>Null Rate: <span className={col.null_percentage > 0 ? 'text-amber-600' : 'text-slate-800'}>{col.null_percentage}%</span></div>
                          </div>
                        </div>

                        {col.type === 'numeric' && col.mean !== null && (
                          <div className="bg-white border border-slate-100 rounded-xl p-2.5 space-y-1 text-[9px] text-slate-500 font-semibold shadow-inner-sm">
                            <div className="flex justify-between"><span>Mean:</span><span className="text-slate-800 font-bold">{col.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between"><span>Min:</span><span className="text-slate-800 font-bold">{col.min}</span></div>
                            <div className="flex justify-between"><span>Max:</span><span className="text-slate-800 font-bold">{col.max}</span></div>
                          </div>
                        )}

                        {col.top_values && col.top_values.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Top Values Distribution</span>
                            <div className="space-y-1 bg-white border border-slate-100 p-2.5 rounded-xl shadow-inner-sm">
                              {col.top_values.map((v, vIdx) => {
                                const total = col.count;
                                const pct = total > 0 ? (v.count / total) * 100 : 0;
                                return (
                                  <div key={vIdx} className="space-y-0.5 text-[9px] text-slate-600 font-medium">
                                    <div className="flex justify-between">
                                      <span className="truncate max-w-[120px] font-semibold">{v.value === "" || v.value === "None" ? "N/A" : v.value}</span>
                                      <span className="text-slate-400 text-[8px] font-semibold">{pct.toFixed(0)}% ({v.count})</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={`${isCompact ? 'p-4' : 'p-8'} max-w-2xl space-y-6 flex-1`}>
            <h1 className="text-2xl font-black text-slate-800 mb-6">User Settings</h1>

            {/* UI Customization */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-600" /> Interface Preferences
              </h2>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Key className="h-4 w-4 text-indigo-500" /> API Keys
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Configure your own Groq API Key to bypass public limits.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Groq API Key (Optional)</label>
                    <input
                      type="password"
                      value={groqApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-slate-600"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">If provided, queries will use this key securely. Not stored on our servers.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Application Theme</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Switch between light and dark modes.</p>
                </div>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value as any)}
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
        )}

      </main>
    </div>
  );
}