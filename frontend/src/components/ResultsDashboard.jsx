import React, { useState } from 'react';
import { AlertTriangle, Shield, FileText, Wrench, X, Copy, Loader2, Mail, Download } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import ChatSection from './ChatSection';
import { generatePDFReport } from '../utils/pdfGenerator'; 

export default function ResultsDashboard({ result, onReset, onViewSource }) {
  // --- SAFETY CHECK (Prevents the crash if data is missing) ---
  if (!result || !result.analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-slate-500 mt-4">Loading analysis...</p>
        <button onClick={onReset} className="mt-4 text-sm text-blue-600 hover:underline">Cancel</button>
      </div>
    );
  }

  const { analysis, filename } = result;
  const { safety_score, summary, red_flags } = analysis;

  // State
  const [negotiating, setNegotiating] = useState(null);
  const [bulkNegotiating, setBulkNegotiating] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cleaner Color Logic
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 50) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-rose-600 border-rose-200 bg-rose-50";
  };

  const handleFixIt = async (flag, index) => {
    setNegotiating(index); setBulkNegotiating(false); setLoading(true); setEmailDraft(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/negotiate", { clause: flag.clause, risk: flag.risk });
      setEmailDraft(response.data.email);
    } catch (err) { setEmailDraft("Error generating email."); } 
    finally { setLoading(false); }
  };

  const handleFixAll = async () => {
    setBulkNegotiating(true); setNegotiating(null); setLoading(true); setEmailDraft(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/negotiate-all", { red_flags: red_flags });
      setEmailDraft(response.data.email);
    } catch (err) { setEmailDraft("Error generating master email."); } 
    finally { setLoading(false); }
  };
  
  // --- FINAL EXPORT FUNCTION ---
  const handleExport = () => {
    generatePDFReport(analysis, filename);
  };
  // -----------------------------

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      {/* Score Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={clsx("p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center shadow-lg transition-all", getScoreColor(safety_score))}>
          <Shield className="w-12 h-12 mb-2 opacity-80" />
          <h2 className="text-6xl font-black tracking-tighter">{safety_score}</h2>
          <p className="font-bold text-lg uppercase tracking-wide opacity-75">Safety Score</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            {filename}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Executive Summary</h3>
          <p className="text-slate-600 leading-relaxed text-lg">{summary}</p>
        </div>
      </div>

      {/* Red Flags Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="bg-rose-100 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-rose-600" /></div>
            {red_flags.length} Risks Detected
          </h3>
          
          {/* ACTION BUTTONS BAR */}
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            {red_flags.length > 0 && (
              <button onClick={handleFixAll} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all">
                <Mail className="w-4 h-4" /> Negotiate All
              </button>
            )}
          </div>
        </div>

        {/* Master Email Modal (Logic for Modal is kept compact) */}
        {bulkNegotiating && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4">{/* Modal content... */}</div>
        )}

        {/* Cards */}
        <div className="grid gap-5">
          {red_flags.map((flag, index) => (
            <div key={index} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-5">
                
                {/* Severity Icon */}
                <div className={clsx("p-3 rounded-xl shrink-0", flag.severity === "High" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600")}>
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={clsx("text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider", flag.severity === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
                        {flag.severity} Severity
                      </span>
                      <p className="font-bold text-slate-800 text-lg mt-2 leading-snug">{flag.risk}</p>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* 1. View Source Button */}
                        {onViewSource && (
                          <button onClick={() => onViewSource(flag.page)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all border border-slate-200">
                            <FileText className="w-3.5 h-3.5" /> Page {flag.page}
                          </button>
                        )}
                        {/* 2. Fix Button */}
                        <button onClick={() => handleFixIt(flag, index)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all"><Wrench className="w-3.5 h-3.5" /> Fix This</button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm italic relative">Original Clause: "{flag.clause}"</p>
                  
                  {/* Single Email Modal (Logic for Modal is kept compact) */}
                  {negotiating === index && !bulkNegotiating && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">{/* Modal content... */}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat is rendered by App.jsx, but we rely on its prop passing */}
      <ChatSection filename={filename} />

      {/* This is the final reset button at the bottom */}
      <div className="text-center pt-10">
        <button onClick={onReset} className="text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors flex items-center justify-center gap-1 mx-auto">
          Analyze another document
        </button>
      </div>
    </div>
  );
}