import React, { useState } from 'react';
import { Sparkles, Moon, Star, PenTool, Loader2 } from 'lucide-react';
import { generateNaatText } from './services/geminiService';
import { NaatResponse } from './types';
import NaatDisplay from './components/NaatDisplay';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [naatData, setNaatData] = useState<NaatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setNaatData(null);

    try {
      const data = await generateNaatText(topic);
      setNaatData(data);
    } catch (err) {
      setError('Failed to generate Naat. Please try again or check your connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
      
      {/* Header */}
      <header className="relative z-10 w-full bg-emerald-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="relative">
               <Moon className="w-8 h-8 text-amber-400 fill-current" />
               <Star className="w-3 h-3 text-white absolute top-1 right-0 animate-pulse" />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight">Naat Nigar</h1>
               <p className="text-xs text-emerald-300 tracking-widest uppercase">AI Poetry Generator</p>
             </div>
          </div>
          <button className="text-emerald-200 hover:text-white transition-colors">
            <span className="hidden md:inline font-urdu text-lg">اردو</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* Search / Hero Section */}
        <div className="w-full max-w-2xl text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 font-heading-urdu">
            Create Beautiful Naats
          </h2>
          <p className="text-slate-500 mb-8 text-lg">
            Enter a topic (e.g., "Madina", "Peace", "Love") and let AI compose a professional Naat for you in Urdu.
          </p>

          <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex bg-white rounded-full p-2 shadow-xl ring-1 ring-slate-900/5">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter Naat topic here (Urdu or English)..." 
                  className="flex-1 px-6 py-3 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none text-lg font-urdu"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {/* Quick Tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Madina', 'Rahmat', 'Noor', 'Peace', 'Prophet Muhammad (PBUH)'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setTopic(tag)}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-emerald-400 hover:text-emerald-700 transition-colors shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl mb-8 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Results */}
        {naatData && !isLoading && (
          <div className="w-full animate-fade-in-up">
            <NaatDisplay data={naatData} />
          </div>
        )}
        
        {/* Placeholder / Empty State */}
        {!naatData && !isLoading && !error && (
          <div className="mt-12 text-slate-300 flex flex-col items-center">
            <PenTool className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm uppercase tracking-widest opacity-40">Ready to compose</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-slate-400 text-sm">
        <p>Powered by Google Gemini AI • Naat Nigar © {new Date().getFullYear()}</p>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-fade-in {
            animation: opacity 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default App;
