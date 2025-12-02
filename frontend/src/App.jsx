import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDashboard from './components/ResultsDashboard'; // <--- NEW IMPORT
import { ShieldAlert } from 'lucide-react';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
            Deal <span className="text-red-600">Breaker</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upload any contract. Our AI will find the red flags before you sign.
          </p>
        </div>

        {/* Dynamic Content */}
        {!analysisResult ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <FileUpload onAnalysisComplete={setAnalysisResult} />
          </div>
        ) : (
          <ResultsDashboard 
            result={analysisResult} 
            onReset={() => setAnalysisResult(null)} 
          />
        )}

      </div>
    </div>
  );
}

export default App;