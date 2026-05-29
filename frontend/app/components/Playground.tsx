import React from 'react';
import {
  ResponsiveContainer, BarChart as RechartsBarChart, Bar,
  LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart,
  Pie, Cell, XAxis, YAxis, Tooltip, Legend, AreaChart as RechartsAreaChart,
  Area
} from 'recharts';
import {
  Database, AlertCircle, Table, FileSpreadsheet,
  RefreshCw, Sparkles, Play, History, ChevronRight, BarChart3, HelpCircle,
  Mic, MicOff, Download, Code, Terminal, Upload, Zap, User
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const downloadDummyCSV = () => {
  const csvHeaders = "Order ID,Order Date,Category,Product,Sales,Quantity,Discount,Profit,Region,Segment";
  const csvRows = [
    "CA-2026-152156,2026-05-01,Furniture,Chairs,261.96,2,0.00,41.91,South,Consumer",
    "CA-2026-152156,2026-05-02,Furniture,Bookcases,731.94,3,0.00,219.58,South,Consumer",
    "CA-2026-138688,2026-05-03,Office Supplies,Labels,14.62,2,0.00,6.87,West,Corporate",
    "US-2026-108966,2026-05-11,Furniture,Tables,957.57,5,0.45,-383.03,South,Consumer",
    "US-2026-108966,2026-05-12,Office Supplies,Storage,22.368,2,0.20,2.5164,South,Consumer",
    "CA-2026-115812,2026-05-13,Furniture,Art,48.86,7,0.00,14.1694,West,Consumer",
    "CA-2026-115812,2026-05-14,Office Supplies,Phones,7.28,4,0.00,1.9656,West,Consumer",
    "CA-2026-115812,2026-05-15,Office Supplies,Binders,907.152,6,0.20,90.7152,West,Consumer",
    "CA-2026-115812,2026-05-16,Office Supplies,Appliances,18.504,3,0.20,5.7825,West,Consumer",
    "CA-2026-115812,2026-05-17,Office Supplies,Paper,114.90,5,0.00,34.47,West,Consumer"
  ];
  const csvContent = [csvHeaders, ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sample_sales_data.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface PlaygroundProps {
  activeFile: any;
  chatThreads: { [key: string]: any[] };
  setChatThreads: (threads: any) => void;
  isQuerying: boolean;
  nlQuery: string;
  setNlQuery: (query: string) => void;
  dynamicSuggestions: any[];
  handleSendQuery: (query: string, mode?: string) => void;
  handleClearHistory: () => void;
  queryHistory: any[];
  files: any[];
  setActiveFile: (file: any) => void;
  selectedChartOverride: { [key: number]: string };
  setSelectedChartOverride: (override: any) => void;
  setActiveTab: (tab: any) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  theme?: string;
  handleThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  setShowOnboarding?: (show: boolean) => void;
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  onCancelQuery?: () => void;
  onReloadHistoryItem?: (hist: any) => void;
  selectedAiModel?: string;
  setSelectedAiModel?: (model: string) => void;
}

export default function Playground({
  activeFile,
  chatThreads,
  setChatThreads,
  isQuerying,
  nlQuery,
  setNlQuery,
  dynamicSuggestions,
  handleSendQuery,
  handleClearHistory,
  queryHistory,
  files,
  setActiveFile,
  selectedChartOverride,
  setSelectedChartOverride,
  setActiveTab,
  chatEndRef,
  theme,
  handleThemeChange,
  setShowOnboarding,
  handleFileUpload,
  isUploading,
  onCancelQuery,
  onReloadHistoryItem,
  selectedAiModel,
  setSelectedAiModel
}: PlaygroundProps) {
  const [isListening, setIsListening] = React.useState(false);
  const [queryMode, setQueryMode] = React.useState<'nl' | 'sql'>('nl');
  const recognitionRef = React.useRef<any>(null);
  const [activeMessageTab, setActiveMessageTab] = React.useState<{ [msgIndex: number]: 'chart' | 'table' }>({});

  const isChartable = (data: any[]) => {
    if (!data || data.length <= 1) return false;
    const keys = Object.keys(data[0]);
    const hasNumeric = keys.some(key => {
      const val = data[0][key];
      return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });
    return hasNumeric;
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setNlQuery(resultText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName];
          const stringVal = val === null || val === undefined ? '' : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renders the Recharts visualization based on configs
  const renderMessageChart = (msg: any, msgIndex: number) => {
    if (!msg.data || msg.data.length === 0) return null;

    const config = msg.visualization_config || {
      recommended: true,
      type: 'bar',
      x_axis_key: Object.keys(msg.data[0])[0],
      y_axis_key: Object.keys(msg.data[0]).find(k => typeof msg.data[0][k] === 'number') || Object.keys(msg.data[0])[0]
    };

    const recommendedType = (!config.type || config.type === 'none') ? 'bar' : config.type;
    const activeChartType = selectedChartOverride[msgIndex] || recommendedType;

    const xKey = config.x_axis_key || Object.keys(msg.data[0])[0] || "";
    const yKey = config.y_axis_key || Object.keys(msg.data[0]).find(k => typeof msg.data[0][k] === 'number') || Object.keys(msg.data[0])[0] || "";

    if (!xKey || !yKey) return null;

    // Check if keys exist in data keys
    const firstRowKeys = Object.keys(msg.data[0]);
    const xKeyExists = firstRowKeys.some(k => k.toLowerCase() === xKey.toLowerCase());
    const yKeyExists = firstRowKeys.some(k => k.toLowerCase() === yKey.toLowerCase());

    const actualXKey = xKeyExists ? firstRowKeys.find(k => k.toLowerCase() === xKey.toLowerCase())! : xKey;
    const actualYKey = yKeyExists ? firstRowKeys.find(k => k.toLowerCase() === yKey.toLowerCase())! : yKey;

    const formattedData = msg.data.map((row: any) => {
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

        <div className="w-full h-64 pt-2 font-medium text-[10px] text-slate-500" style={{ minWidth: 0, minHeight: 0 }}>
          {activeChartType === 'none' ? (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              Chart hidden. Select a chart type above to unhide.
            </div>
          ) : (
          <ResponsiveContainer width="99%" height={240}>
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
                  cx="50%" cy="45%" outerRadius={70} labelLine={false} label={({ name, percent }: any) => `${String(name || '').substring(0, 10)}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {formattedData.map((entry: any, index: number) => (
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
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-slate-50 to-slate-100/50 relative overflow-hidden">
        {/* Playground Header (Global) */}
        <header className="px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-20 shrink-0 w-full overflow-hidden">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Scope:</span>
            {files && files.length > 0 ? (
              <div className="relative inline-flex items-center">
                <select
                  value={activeFile?.id || ""}
                  onChange={(e) => {
                    const selected = files.find(f => f.id === e.target.value);
                    if (selected) setActiveFile(selected);
                  }}
                  className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/80 text-indigo-700 font-bold px-3.5 py-1.5 pr-8 rounded-full text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none shadow-sm transition-all"
                >
                  {!activeFile && <option value="">Select a Dataset...</option>}
                  {files.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.file_name} ({f.row_count.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 flex items-center text-indigo-500">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-500">No active dataset. Go to Data Catalog.</span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap md:flex-nowrap w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {activeFile && (
              <button
                onClick={handleClearHistory}
                className="text-[10px] font-bold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 shadow-sm shrink-0"
                title="Clear chat context memory"
              >
                <RefreshCw className="h-3 w-3" />
                Clear Chat
              </button>
            )}

            {/* AI Model Toggle */}
            {setSelectedAiModel && selectedAiModel && (
              <div className="relative inline-flex items-center shrink-0">
                <select
                  value={selectedAiModel}
                  onChange={(e) => setSelectedAiModel(e.target.value as any)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 pr-7 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none shadow-sm transition-all"
                >
                  <option value="gemini-2.5-flash">Gemini Flash</option>
                  <option value="gemini-2.5-flash-lite">Gemini Flash-Lite</option>
                </select>
                <div className="pointer-events-none absolute right-2 flex items-center text-slate-400">
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Theme Toggle (Playground Header) */}
            {handleThemeChange && theme && (
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner shrink-0">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleThemeChange(t as any)}
                    className={`px-2 py-1 text-[9px] font-bold rounded-md capitalize transition-all ${theme === t ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* Help Guide Button */}
            {setShowOnboarding && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 bg-slate-50 shadow-sm"
                title="Open User Guide"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

      {/* Main Content Area (Chat + Logs) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Chat Conversation Thread Section */}
        <div className="flex-1 flex flex-col border-r border-slate-200/60 min-h-0 relative z-0">

          {/* Chat Speech Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {!activeFile ? (
            <div className="h-full max-w-2xl mx-auto flex flex-col justify-center py-8 px-4 space-y-6">
              {files && files.length > 0 ? (
                // Dataset Selection State
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <div className="inline-flex bg-indigo-50 p-3 rounded-2xl text-indigo-500 border border-indigo-100 shadow-sm">
                      <Database className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-800">Select Dataset to Query</h3>
                    <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                      Choose one of your uploaded sandboxes to start querying. The AI compiler will bind to the selected schema.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto p-1">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setActiveFile(file)}
                        className="bg-white hover:bg-indigo-50/10 border border-slate-200 hover:border-indigo-500 rounded-2xl p-4 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                            <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{file.file_name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold space-y-1">
                            <div>Table: <span className="font-mono text-slate-550">{file.table_name}</span></div>
                            <div>Rows: <span className="text-slate-600 font-bold">{file.row_count.toLocaleString()}</span></div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFile(file);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 group-hover:bg-indigo-600 group-hover:border-indigo-650 text-slate-700 group-hover:text-white font-bold text-[10px] py-1.5 rounded-xl transition-all mt-3 text-center"
                        >
                          Select & Query
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Or Upload New</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                </div>
              ) : null}

              {/* Upload Dropzone option directly in Playground */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs">Upload New Dataset</h4>
                  <p className="text-[11px] text-slate-500 font-semibold max-w-sm mx-auto">
                    Initialize a new sandbox environment by importing any system CSV file.
                  </p>
                </div>
                {handleFileUpload && (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-5 cursor-pointer bg-slate-50/50 transition-colors group">
                      <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {isUploading ? "Processing schema Ingestion..." : "Select CSV Dataset"}
                      </span>
                      <span className="text-[9px] text-slate-405 mt-1">Accepts schemas up to 10MB</span>
                      <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={downloadDummyCSV}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-2 rounded-xl transition-all border border-indigo-100 w-full justify-center shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Sample CSV to Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Sleek User Guide Banner for Playground */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 z-10">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="h-4.5 w-4.5" /> Quick Guide: AI Playground</h3>
                  <p className="text-xs text-emerald-100 font-medium max-w-xl">
                    Ask analytical questions about your active dataset in plain English. The AI compiler will translate it into a SQL query, fetch the matching records, and dynamically render data tables or visual charts.
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

              {(chatThreads[activeFile.id] || []).length === 0 ? (
                <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
                  {/* Chat Welcome Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                    <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl border border-indigo-100 shadow-sm shrink-0">
                      <Sparkles className="h-7 w-7 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-slate-800 flex items-center justify-center md:justify-start gap-1.5">
                        <span>AI Analytical Sandbox Active</span>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Ready to process questions about <span className="text-indigo-600 font-bold">{activeFile.file_name}</span>. Enter a query below or select a recommended analytical scenario:
                      </p>
                    </div>
                  </div>

                  {/* Onboarding Suggestions Grid */}
                  {dynamicSuggestions && dynamicSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Suggested Scenarios</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dynamicSuggestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendQuery(q.text, 'nl')}
                            disabled={isQuerying}
                            className="bg-white hover:bg-indigo-50/15 border border-slate-200 hover:border-indigo-500/50 rounded-2xl p-4 text-left shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-28 group relative overflow-hidden"
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 bg-slate-100 px-2 py-0.5 rounded-md inline-block mb-2 self-start">
                              {q.category || "General Query"}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 leading-relaxed block line-clamp-2 pr-4 group-hover:text-indigo-700 transition-colors">
                              {q.text}
                            </span>
                            <div className="absolute right-3 bottom-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                (chatThreads[activeFile.id] || []).map((msg, index) => (
                  <div key={index} className={`flex w-full ${msg.role === 'user' ? 'py-6' : 'bg-white/40 border-y border-slate-200/40 py-8 shadow-sm'} justify-center`}>
                    <div className="w-full max-w-4xl flex gap-4 px-4 sm:px-6">
                      {/* Avatar */}
                      <div className="shrink-0 mt-0.5">
                        {msg.role === 'user' ? (
                          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200/50 shadow-sm">
                            <User className="h-4.5 w-4.5 text-indigo-600" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-600/20">
                            <Sparkles className="h-4.5 w-4.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 space-y-4">
                        {msg.role === 'user' && (
                          <p className="text-[13px] font-semibold text-slate-800 leading-relaxed pt-1">{msg.content}</p>
                        )}
                        
                        {msg.role === 'model' && (
                          <div className={`space-y-4 text-slate-800 w-full ${msg.isError ? 'p-4 rounded-xl ring-1 ring-rose-200 bg-rose-50/80' : ''}`}>
                            
                            {/* Attributed Source File */}
                            {msg.source_file && !msg.isError && (
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                                <Database className="h-3 w-3 text-indigo-500" /> Source: {msg.source_file}
                              </div>
                            )}

                            {/* Response content description */}
                            <div className="flex items-start space-x-2">
                              {msg.isError && <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />}
                              <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{msg.content}</p>
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

                      {/* Unified Result Container (Table vs Chart Tabs) */}
                      {msg.data && msg.data.length > 0 && (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 shadow-inner-sm mt-3 space-y-3 p-4">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            {/* Segmented control for Table vs Chart */}
                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setActiveMessageTab({ ...activeMessageTab, [index]: 'table' })}
                                className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                                  (activeMessageTab[index] || (msg.visualization_config?.recommended && msg.visualization_config?.type !== 'none' && isChartable(msg.data) ? 'chart' : 'table')) === 'table'
                                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <Table className="h-3 w-3 text-slate-500" />
                                Data Table
                              </button>
                              {isChartable(msg.data) && (
                                <button
                                  type="button"
                                  onClick={() => setActiveMessageTab({ ...activeMessageTab, [index]: 'chart' })}
                                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                                    (activeMessageTab[index] || (msg.visualization_config?.recommended && msg.visualization_config?.type !== 'none' && isChartable(msg.data) ? 'chart' : 'table')) === 'chart'
                                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  <BarChart3 className="h-3 w-3 text-indigo-500" />
                                  Visual Chart
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => downloadCSV(msg.data, `${activeFile ? activeFile.file_name.replace('.csv', '') : 'query'}_result_${index}.csv`)}
                              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/85 border border-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                              title="Export findings to CSV spreadsheet"
                            >
                              <Download className="h-3 w-3" /> Export CSV
                            </button>
                          </div>

                          {/* Tab Content */}
                          {((activeMessageTab[index] || ((msg.visualization_config?.recommended && msg.visualization_config?.type !== 'none' && isChartable(msg.data)) ? 'chart' : 'table')) === 'chart') && isChartable(msg.data) ? (
                            <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                              {renderMessageChart(msg, index)}
                            </div>
                          ) : (
                            <div className="max-w-full overflow-x-auto border border-slate-100 rounded-xl bg-white max-h-60">
                              <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                    {Object.keys(msg.data[0]).map((header) => (
                                      <th key={header} className="px-3 py-2.5 capitalize truncate">{header.replace(/_/g, ' ')}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  {msg.data.map((row: any, rIdx: number) => (
                                    <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                      {Object.values(row).map((val: any, cIdx: number) => (
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
                          )}
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
            </div>
          ))
        )}
        </>
      )}

          {/* Query loading skeleton */}
          {isQuerying && (
            <div className="flex w-full bg-white/40 border-y border-slate-200/40 py-8 shadow-sm justify-center">
              <div className="w-full max-w-4xl flex gap-4 px-4 sm:px-6">
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-4 pt-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse block">
                    AI is analyzing...
                  </span>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <p className="text-[13px] font-semibold ml-2">Writing SQL and parsing your dataset...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Console Form */}
        {activeFile && (
          <div className="p-4 sm:p-6 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 space-y-4 sticky bottom-0 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            
            {/* Input Mode Toggle & Voice Indicator */}
            <div className="flex items-center justify-between">
              {/* Segmented Mode Button */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setQueryMode('nl');
                    setNlQuery('');
                  }}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${queryMode === 'nl'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Terminal className="h-3 w-3" />
                  AI Natural Language
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQueryMode('sql');
                    // Pre-fill active file query if empty
                    if (!nlQuery.trim() && activeFile) {
                      setNlQuery(`SELECT * FROM ${activeFile.table_name} LIMIT 5;`);
                    }
                  }}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${queryMode === 'sql'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Code className="h-3 w-3" />
                  Direct SQL Query
                </button>
              </div>

              {/* Suggestions text or raw schema hint */}
              {activeFile && (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Schema: {activeFile.columns.slice(0, 5).join(', ')}
                  {activeFile.columns.length > 5 && ' ...'}
                </span>
              )}
            </div>

            {/* Suggested questions box */}
            {queryMode === 'nl' && (
              <div className="flex items-start space-x-2">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {dynamicSuggestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendQuery(q.text, 'nl')}
                      disabled={isQuerying}
                      className="bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 text-[10px] font-bold text-indigo-600 px-2.5 py-1 rounded-full transition-all"
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(nlQuery, queryMode);
              }}
              className="flex gap-3 items-center"
            >
              {queryMode === 'nl' && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl border transition-all shadow-sm ${isListening 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'}`}
                  title={isListening ? "Listening... click to stop" : "Start speaking question"}
                >
                  {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                </button>
              )}

              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder={queryMode === 'nl' 
                  ? "e.g. 'What is the sum of revenue for Q1 by region?'" 
                  : `e.g. SELECT * FROM ${activeFile ? activeFile.table_name : 'table'} LIMIT 10;`}
                disabled={isQuerying}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 bg-white/50 backdrop-blur-sm text-xs placeholder:text-slate-400 font-semibold shadow-inner-sm transition-all"
              />
              {isQuerying ? (
                <button
                  type="button"
                  onClick={onCancelQuery}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 text-xs shadow-md shadow-rose-600/20 cursor-pointer animate-pulse hover:-translate-y-0.5"
                  title="Force cancel execution"
                >
                  <span>Cancel Query</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!nlQuery.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:from-slate-200 disabled:to-slate-100 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 text-xs shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  <span>{queryMode === 'nl' ? "Run Query" : "Run SQL"}</span>
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Playground Right Side Execution Logs Panel */}
      <div className="hidden lg:flex w-80 flex-col bg-white overflow-y-auto h-full border-l border-slate-200 relative z-0">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-2 shadow-sm">
          <History className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Execution Logs</h3>
        </div>

        <div className="p-4 divide-y divide-slate-100">
          {isQuerying && (
            <div className="w-full text-left py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-start space-x-2 text-xs font-semibold animate-pulse mb-3 p-2">
              <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin shrink-0 mt-0.5" />
              <div className="space-y-1 overflow-hidden w-full">
                <p className="text-slate-700 font-bold leading-relaxed truncate">Executing AI compiler...</p>
                <code className="text-[10px] text-slate-400 font-mono block truncate">Analyzing schema...</code>
                <span className="text-[9px] text-indigo-500 block font-bold">In progress...</span>
              </div>
            </div>
          )}
          {queryHistory.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-8">No queries executed yet.</p>
          ) : (
            queryHistory.map((hist, hIdx) => (
              <button
                key={hIdx}
                onClick={() => {
                  if (onReloadHistoryItem) {
                    onReloadHistoryItem(hist);
                  } else {
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
    </div>
  );
}
