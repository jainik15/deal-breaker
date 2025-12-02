import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function FileUpload({ onAnalysisComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Handle Drag Events (Visual feedback)
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // 2. Handle Drop Event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only PDF files are allowed!");
      }
    }
  }, []);

  // 3. Handle Manual Selection
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // 4. Send to Backend
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Connect to your FastAPI Backend
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Send the data back up to the parent component
      onAnalysisComplete(response.data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Drag & Drop Zone */}
      <div
        className={clsx(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
          error && "border-red-500 bg-red-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf"
          disabled={loading}
        />

        {/* Dynamic Icons based on State */}
        <div className="flex flex-col items-center space-y-3 pointer-events-none">
          {loading ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          ) : file ? (
            <FileText className="w-12 h-12 text-blue-600" />
          ) : error ? (
            <AlertCircle className="w-12 h-12 text-red-500" />
          ) : (
            <UploadCloud className="w-12 h-12 text-gray-400" />
          )}

          <div className="text-center">
            {loading ? (
              <p className="text-lg font-medium text-blue-600">Analyzing Contract...</p>
            ) : file ? (
              <p className="text-lg font-medium text-gray-700">{file.name}</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700">
                  <span className="text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">PDF only (Max 10MB)</p>
              </>
            )}
            {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
          </div>
        </div>
      </div>

      {/* Upload Button */}
      {file && !loading && (
        <button
          onClick={handleUpload}
          className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
        >
          Run Analysis <CheckCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}