import React from 'react';
import {
  ResponsiveContainer, BarChart as RechartsBarChart, Bar,
  LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart,
  Pie, Cell, XAxis, YAxis, Tooltip, Legend, AreaChart as RechartsAreaChart,
  Area
} from 'recharts';
import {
  Database, AlertCircle, Table, FileSpreadsheet,
  RefreshCw, Sparkles, Play, History, ChevronRight, BarChart3
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

interface PlaygroundProps {
  activeFile: any;
  chatThreads: { [key: string]: any[] };
  setChatThreads: (threads: any) => void;
  isQuerying: boolean;
  nlQuery: string;
  setNlQuery: (query: string) => void;
  dynamicSuggestions: any[];
  handleSendQuery: (query: string) => void;
  handleClearHistory: () => void;
  queryHistory: any[];
  files: any[];
  setActiveFile: (file: any) => void;
  selectedChartOverride: { [key: number]: string };
  setSelectedChartOverride: (override: any) => void;
  setActiveTab: (tab: any) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
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
  chatEndRef
}: PlaygroundProps) {

  // Renders the Recharts visualization based on configs
  const renderMessageChart = (msg: any, msgIndex: number) => {
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
                  cx="50%" cy="45%" outerRadius={70} labelLine={false} label={({ name, percent }: any) => `${(name || '').substring(0, 10)}: ${((percent || 0) * 100).toFixed(0)}%`}
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
        </div>
      </div>
    );
  };

  return (
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
  );
}
