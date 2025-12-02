import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Shield, FileText, Wrench, X, Copy, Loader2, Mail } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function ResultsDashboard({ result, onReset }) {
  const { analysis, filename } = result;
  const { safety_score, summary, red_flags } = analysis;

  // State
  const [negotiating, setNegotiating] = useState(null); // Index for single fix
  const [bulkNegotiating, setBulkNegotiating] = useState(false); // State for "Fix All"
  const [emailDraft, setEmailDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 border-green-200 bg-green-50";
    if (score >= 50) return "text-yellow-600 border-yellow-200 bg-yellow-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  // 1. Single Fix Function
  const handleFixIt = async (flag, index) => {
    setNegotiating(index);
    setBulkNegotiating(false);
    setLoading(true);
    setEmailDraft(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/negotiate", {
        clause: flag.clause,
        risk: flag.risk
      });
      setEmailDraft(response.data.email);
    } catch (err) {
      setEmailDraft("Error generating email.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Bulk Fix Function (NEW)
  const handleFixAll = async () => {
    setBulkNegotiating(true);
    setNegotiating(null); // Close any single boxes
    setLoading(true);
    setEmailDraft(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/negotiate-all", {
        red_flags: red_flags
      });
      setEmailDraft(response.data.email);
    } catch (err) {
      setEmailDraft("Error generating master email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={clsx("p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center shadow-sm", getScoreColor(safety_score))}>
          <Shield className="w-12 h-12 mb-2 opacity-80" />
          <h2 className="text-6xl font-black tracking-tighter">{safety_score}</h2>
          <p className="font-bold text-lg uppercase tracking-wide opacity-75">Safety Score</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 text-slate-500">
            <FileText className="w-5 h-5" />
            <span className="font-medium text-sm">{filename}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">AI Summary</h3>
          <p className="text-slate-600 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Red Flags Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Identified Risks <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">{red_flags.length} Issues</span>
          </h3>
          
          {/* THE NEW MASTER BUTTON */}
          {red_flags.length > 0 && (
            <button 
              onClick={handleFixAll}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Mail className="w-4 h-4" /> Draft Master Email
            </button>
          )}
        </div>

        {/* Master Email Modal Area */}
        {bulkNegotiating && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <h4 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" /> 
                Professional Negotiation Letter
              </h4>
              
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                   <span className="animate-pulse">Consulting legal AI...</span>
                </div>
              ) : (
                <>
                  <textarea 
                    readOnly 
                    className="w-full bg-slate-800 text-slate-300 p-4 rounded-xl text-sm h-64 focus:outline-none resize-none leading-relaxed border border-slate-700"
                    value={emailDraft || ""}
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button 
                      onClick={() => {navigator.clipboard.writeText(emailDraft)}} 
                      className="text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      <Copy className="w-4 h-4" /> Copy to Clipboard
                    </button>
                    <button 
                      onClick={() => setBulkNegotiating(false)} 
                      className="text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600"
                    >
                      <X className="w-4 h-4" /> Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Risk Cards */}
        <div className="grid gap-4">
          {red_flags.map((flag, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <div className={clsx("p-2 rounded-lg shrink-0", flag.severity === "High" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600")}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", flag.severity === "High" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                        {flag.severity} Risk
                      </span>
                      <p className="font-semibold text-slate-800 text-lg mt-1 mb-2">"{flag.risk}"</p>
                    </div>
                    {/* Single Fix Button */}
                    <button 
                      onClick={() => handleFixIt(flag, index)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      <Wrench className="w-4 h-4" /> Fix
                    </button>
                  </div>
                  
                  <p className="text-slate-500 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    Original Clause: "{flag.clause}"
                  </p>

                  {/* Single Email Generator Box */}
                  {negotiating === index && !bulkNegotiating && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl relative border border-slate-700 shadow-xl">
                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                          <Wrench className="w-4 h-4" /> 
                          Quick Fix Draft
                        </h4>
                        
                        {loading ? (
                          <div className="py-4 text-center text-slate-400">
                             <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          </div>
                        ) : (
                          <>
                            <textarea 
                              readOnly 
                              className="w-full bg-slate-800 text-slate-300 p-3 rounded-lg text-sm h-32 focus:outline-none resize-none"
                              value={emailDraft || ""}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => {navigator.clipboard.writeText(emailDraft)}} className="text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors">
                                <Copy className="w-3 h-3" /> Copy
                              </button>
                              <button onClick={() => setNegotiating(null)} className="text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                <X className="w-3 h-3" /> Close
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-8">
        <button onClick={onReset} className="text-slate-500 hover:text-blue-600 font-medium hover:underline transition-colors">Analyze another document</button>
      </div>
    </div>
  );
}