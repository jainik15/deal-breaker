import React from 'react';
import { AlertTriangle, CheckCircle, Shield, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function ResultsDashboard({ result, onReset }) {
  const { analysis, filename } = result;
  const { safety_score, summary, red_flags } = analysis;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 border-green-200 bg-green-50";
    if (score >= 50) return "text-yellow-600 border-yellow-200 bg-yellow-50";
    return "text-red-600 border-red-200 bg-red-50";
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
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Identified Risks <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">{red_flags.length} Issues</span>
        </h3>

        <div className="grid gap-4">
          {red_flags.map((flag, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={clsx("p-2 rounded-lg shrink-0", flag.severity === "High" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600")}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", flag.severity === "High" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                      {flag.severity} Risk
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 text-lg mb-2">"{flag.risk}"</p>
                  <p className="text-slate-500 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    Original Clause: "{flag.clause}"
                  </p>
                </div>
              </div>
            </div>
          ))}

          {red_flags.length === 0 && (
            <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-green-800 font-bold text-xl">No Risks Found!</h3>
              <p className="text-green-600">This contract looks unusually safe.</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-8">
        <button onClick={onReset} className="text-slate-500 hover:text-blue-600 font-medium hover:underline transition-colors">Analyze another document</button>
      </div>
    </div>
  );
}