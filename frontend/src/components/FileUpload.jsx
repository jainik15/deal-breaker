import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2, Link, File } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function FileUpload({ onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'url'
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- PDF LOGIC ---
  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") { setFile(droppedFile); setError(null); }
      else { setError("Only PDF files are allowed!"); }
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) { setFile(e.target.files[0]); setError(null); }
  };

  const handlePdfUpload = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, { headers: { "Content-Type": "multipart/form-data" } });
      onAnalysisComplete(response.data);
    } catch (err) { setError("Analysis failed. Backend error."); } 
    finally { setLoading(false); }
  };

  // --- URL LOGIC ---
  const handleUrlUpload = async () => {
    if (!url) return;
    setLoading(true); setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze-url", { url: url });
      onAnalysisComplete(response.data);
    } catch (err) { setError("Failed to scrape URL. Website might be blocking bots."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      
      {/* TABS */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('pdf')}
          className={clsx("flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all", activeTab === 'pdf' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <File className="w-4 h-4" /> Upload PDF
        </button>
        <button 
          onClick={() => setActiveTab('url')}
          className={clsx("flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all", activeTab === 'url' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <Link className="w-4 h-4" /> Paste URL
        </button>
      </div>

      {/* PDF VIEW */}
      {activeTab === 'pdf' && (
        <>
          <div className={clsx("relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer", dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100", error && "border-red-500 bg-red-50")} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept=".pdf" disabled={loading} />
            <div className="flex flex-col items-center space-y-3 pointer-events-none">
              {loading ? <Loader2 className="w-12 h-12 text-blue-600 animate-spin" /> : file ? <FileText className="w-12 h-12 text-blue-600" /> : <UploadCloud className="w-12 h-12 text-gray-400" />}
              <div className="text-center">
                {loading ? <p className="text-lg font-medium text-blue-600">Analyzing...</p> : file ? <p className="text-lg font-medium text-gray-700">{file.name}</p> : <><p className="text-lg font-medium text-gray-700"><span className="text-blue-600">Click to upload</span> or drag PDF</p><p className="text-sm text-gray-500">Max 10MB</p></>}
                {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
              </div>
            </div>
          </div>
          {file && !loading && (
            <button onClick={handlePdfUpload} className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">Run Analysis <CheckCircle className="w-5 h-5" /></button>
          )}
        </>
      )}

      {/* URL VIEW */}
      {activeTab === 'url' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Website Link</label>
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="https://example.com/terms" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</p>}
          
          <button 
            onClick={handleUrlUpload} 
            disabled={!url || loading}
            className="mt-4 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Scan Website</>}
          </button>
        </div>
      )}
    </div>
  );
}