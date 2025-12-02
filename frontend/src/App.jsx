import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDashboard from './components/ResultsDashboard';
import PdfViewer from './components/PdfViewer';
import ChatSection from './components/ChatSection';
import { ShieldAlert } from 'lucide-react';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentFile, setCurrentFile] = useState(null); // Stores the actual PDF File object for the Viewer
  const [pdfPage, setPdfPage] = useState(1); // Tracks which page the viewer shows

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 pr-48"> {/* pr-48 pushes content away from the floating chat */}
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2 mb-2">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <h1 className="text-5xl font-extrabold text-slate-900">
            Deal <span className="text-red-600">Breaker</span>
          </h1>
        </div>
        <p className="text-slate-500">AI Contract Analyst</p>
      </div>

      <div className="max-w-[80rem] mx-auto"> {/* Wider container for split screen */}
        {!analysisResult ? (
          // --- UPLOAD VIEW ---
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <FileUpload 
              onAnalysisComplete={(data) => setAnalysisResult(data)} 
              onFileSelect={(file) => setCurrentFile(file)} // Capture file object for PDF Viewer
            />
          </div>
        ) : (
          
          // --- SPLIT SCREEN VIEW (Result + PDF) ---
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[850px]">
            
            {/* LEFT: Dashboard */}
            <div className="overflow-y-auto h-full pr-2 pb-20">
              <ResultsDashboard 
                result={analysisResult} 
                onReset={() => setAnalysisResult(null)}
                onViewSource={(page) => setPdfPage(page)} // When clicked, update PDF page
              />
            </div>

            {/* RIGHT: PDF Viewer (Only renders if currentFile exists) */}
            {currentFile && currentFile.name && currentFile.type === "application/pdf" ? (
               <div className="h-full flex flex-col bg-slate-200 rounded-2xl overflow-hidden border border-slate-300">
                 <div className="bg-white p-3 border-b border-slate-300 font-bold text-slate-700 flex justify-between items-center shadow-sm z-10">
                    <span className="text-sm">Source Document</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">Page {pdfPage}</span>
                 </div>
                 <div className="flex-1 overflow-hidden relative">
                    <PdfViewer file={currentFile} activePage={pdfPage} />
                 </div>
               </div>
            ) : (
              <div className="h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                {currentFile && currentFile.type === 'web' ? 'PDF Preview not available for URLs' : 'Upload PDF to view source'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- FLOATING CHAT WIDGET: ALWAYS RENDERED (FIXED POSITION) --- */}
      <ChatSection filename={analysisResult?.filename || 'document'} />

    </div>
  );
}

export default App;