import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Setup PDF Worker (Essential for react-pdf to work)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function PdfViewer({ file, activePage }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="bg-slate-500/5 rounded-2xl border border-slate-200 h-[800px] flex flex-col overflow-hidden">
      
      {/* Controls */}
      <div className="bg-white p-3 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
        <span className="text-sm font-bold text-slate-600">
          Page {activePage} of {numPages || '--'}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-slate-100 rounded"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1 hover:bg-slate-100 rounded"><ZoomIn className="w-4 h-4" /></button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4 flex justify-center">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="shadow-lg">
          <Page 
            pageNumber={activePage || 1} 
            scale={scale} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className="border border-slate-200"
          />
        </Document>
      </div>
    </div>
  );
}