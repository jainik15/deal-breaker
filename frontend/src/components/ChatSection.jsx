import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, MessageSquare, Loader2, X } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function ChatSection({ filename }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! I've analyzed ${filename}. Ask me anything about it.` }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newUserMsg = { role: 'user', text: question };
    const historyPayload = messages.slice(1).map(msg => ({
      role: msg.role, content: msg.text
    }));

    setMessages([...messages, newUserMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/chat", {
        filename: filename,
        question: question,
        history: historyPayload
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection error. Is backend running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-10 z-50 flex flex-col items-end space-y-4">
        {isOpen && (
        // --- UPDATED: Huge Dimensions + shadow-2xl ---
        <div className="w-[500px] h-[700px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg"><Bot className="w-6 h-6 text-white" /></div>
              <div>
                <h3 className="font-bold text-lg">AI Legal Assistant</h3>
                <p className="text-xs text-slate-400">Online • Context Aware</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={clsx("flex items-start gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                {/* Bubble - Added 'break-words' to fix text overflow */}
                <div className={clsx(
                  "p-4 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm whitespace-pre-wrap break-words", 
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading || !question.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-md"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      )}
      
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="h-16 w-16 bg-slate-900 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-white">
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
}