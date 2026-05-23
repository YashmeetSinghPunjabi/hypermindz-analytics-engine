import React from 'react';
import { Upload, FileSpreadsheet, Eye, BarChart3, Trash2, AlertCircle, Sparkles, HelpCircle, Download } from 'lucide-react';

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

interface DataCatalogProps {
  files: any[];
  activeFile: any;
  setActiveFile: (file: any) => void;
  setActiveTab: (tab: any) => void;
  handlePreviewFile: (file: any) => void;
  handleProfileFile: (file: any) => void;
  handleDeleteFile: (id: string, e: any) => void;
  previewFileItem: any;
  setPreviewFileItem: (file: any) => void;
  previewLoading: boolean;
  previewRows: any[];
  profilingFileItem: any;
  setProfilingFileItem: (file: any) => void;
  profilingLoading: boolean;
  columnProfiles: any[];
  isUploading: boolean;
  uploadError: string | null;
  handleFileUpload: (e: any) => void;
  setShowOnboarding?: (show: boolean) => void;
  onPrefillQuery?: (query: string) => void;
}

export default function DataCatalog({
  files,
  activeFile,
  setActiveFile,
  setActiveTab,
  handlePreviewFile,
  handleProfileFile,
  handleDeleteFile,
  previewFileItem,
  setPreviewFileItem,
  previewLoading,
  previewRows,
  profilingFileItem,
  setProfilingFileItem,
  profilingLoading,
  columnProfiles,
  isUploading,
  uploadError,
  handleFileUpload,
  setShowOnboarding,
  onPrefillQuery
}: DataCatalogProps) {
  // Auto-scroll refs
  const previewRef = React.useRef<HTMLDivElement>(null);
  const profilingRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (previewFileItem && !previewLoading && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [previewFileItem, previewLoading]);

  React.useEffect(() => {
    if (profilingFileItem && !profilingLoading && profilingRef.current) {
      profilingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [profilingFileItem, profilingLoading]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
      {/* Sleek User Guide Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="h-4.5 w-4.5" /> Quick Guide: Data Catalog</h3>
          <p className="text-xs text-indigo-100 font-medium max-w-xl">
            Upload tabular CSV files to ingest them into your database sandbox. Once registered, click the eye icon to preview the table, or the bar chart icon to profile columns and display statistical insights.
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
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Upload any system CSV file. The analytics engine will automatically discover column schema formatting, normalize headings, spin up a dedicated SQLite database, and configure isolated read-only execute boundaries for your user session.
                </p>
                <button
                  type="button"
                  onClick={downloadDummyCSV}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-2 rounded-xl transition-all border border-indigo-100 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Sample CSV to Test
                </button>
              </div>
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
                      setActiveTab('playground');
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
                            setActiveTab('playground');
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
        <div ref={previewRef} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
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
        <div ref={profilingRef} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
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
                      {onPrefillQuery ? (
                        <button
                          onClick={() => {
                            setActiveFile(profilingFileItem);
                            const prompt = col.type === 'numeric'
                              ? `What is the average, min, and max value of ${col.name}?`
                              : `Show the count and percentage distribution of ${col.name}`;
                            onPrefillQuery(prompt);
                          }}
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-xs truncate max-w-[150px] text-left flex items-center gap-1"
                          title={`Click to query ${col.name} instantly`}
                        >
                          <Sparkles className="h-3 w-3 shrink-0 text-indigo-500" />
                          <span>{col.name}</span>
                        </button>
                      ) : (
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{col.name}</span>
                      )}
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
                        {col.top_values.map((v: any, vIdx: number) => {
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
  );
}
