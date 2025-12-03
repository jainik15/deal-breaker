import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDashboard from './components/ResultsDashboard';
import PdfViewer from './components/PdfViewer';
import ChatSection from './components/ChatSection';
import { ShieldAlert } from 'lucide-react';
import clsx from 'clsx'; // Ensure clsx is imported for conditional classes

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentFile, setCurrentFile] = useState(null); 
  const [pdfPage, setPdfPage] = useState(1); 

  // Determine if the current content is a PDF (to show the viewer and split screen)
  const isPdf = currentFile && currentFile.type === "application/pdf";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 pr-48 relative overflow-x-hidden">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2 mb-2">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <h1 className="text-6xl font-extrabold text-slate-900">
            Deal <span className="text-red-600">Breaker</span>
          </h1>
        </div>
        <p className="text-slate-500">AI Contract Analyst</p>
      </div>

      <div className="max-w-[80rem] mx-auto"> 
        {!analysisResult ? (
          // --- UPLOAD VIEW ---
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <FileUpload 
              onAnalysisComplete={(data) => setAnalysisResult(data)} 
              onFileSelect={(file) => setCurrentFile(file)}
            />
          </div>
        ) : (
          
          /* SPLIT SCREEN VIEW (This container now manages the conditional layout) */
          <div 
            className={clsx(
                "grid grid-cols-1 gap-6 h-[850px]",
                isPdf ? "lg:grid-cols-2" : "lg:grid-cols-1" // Use 2 columns for PDF, 1 for URL
            )}
          >
            
            {/* LEFT SIDE: Dashboard (This always exists and takes 2 columns for URL mode) */}
            <div 
              className={clsx(
                  "overflow-y-auto h-full pr-2 pb-20",
                  isPdf ? "lg:col-span-1" : "lg:col-span-2" // Dashboard spans both columns if no PDF viewer
              )}
            >
              <ResultsDashboard 
                result={analysisResult} 
                onReset={() => setAnalysisResult(null)}
                onViewSource={(page) => setPdfPage(page)}
              />
            </div>

            {/* RIGHT SIDE: PDF Viewer (Conditional Render) */}
            {isPdf && (
                <div className="h-full flex flex-col bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 lg:col-span-1">
                  <div className="bg-white p-3 border-b border-slate-300 font-bold text-slate-700 flex justify-between items-center shadow-sm z-10">
                    <span className="text-sm">Source Document</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">Page {pdfPage}</span>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <PdfViewer file={currentFile} activePage={pdfPage} />
                  </div>
                </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING CHAT WIDGET: ALWAYS RENDERED */}
      <ChatSection filename={analysisResult?.filename || currentFile?.name || 'document'} />

    </div>
  );
}

export default App;