import React, { useState } from 'react';
import { Welcome } from './components/Welcome';
import { Loading } from './components/Loading';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { AppState, QuizData, UserAnswers, QuizConfig } from './types';
import { generateQuiz } from './services/geminiService';
import { FALLBACK_QUIZ_DATA } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [error, setError] = useState<string | null>(null);

  const startNewQuiz = async (config: QuizConfig) => {
    setAppState(AppState.LOADING);
    setError(null);
    setUserAnswers({});
    
    try {
      // Get existing hashes to avoid repeats
      const historyStr = localStorage.getItem('dmv_prep_seen_hashes');
      const seenHashes = historyStr ? JSON.parse(historyStr) : [];
      
      const data = await generateQuiz(config, seenHashes);
      setQuizData(data);
      setAppState(AppState.QUIZ);
    } catch (err: any) {
      console.error("Quiz generation failed", err);
      // Display the actual error message for better debugging
      let msg = err.message || "We encountered an issue crafting your unique exam. Please try again.";
      
      // Improve error message for known 401 cases
      if (msg.includes("401") || msg.includes("UNAUTHENTICATED") || msg.includes("CREDENTIALS_MISSING") || msg.includes("Authentication failed")) {
        msg = "Authentication Failed: Please re-select your Google API Key.";
      }
      
      setError(msg);
      setAppState(AppState.ERROR);
    }
  };

  const handleDemoFallback = () => {
    setQuizData(FALLBACK_QUIZ_DATA as unknown as QuizData);
    setAppState(AppState.QUIZ);
    setError(null);
  };

  const handleQuizComplete = (answers: UserAnswers) => {
    setUserAnswers(answers);
    setAppState(AppState.RESULTS);
  };

  const handleRetryKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setAppState(AppState.WELCOME);
      } catch (e) {
        console.error(e);
      }
    } else {
      setAppState(AppState.WELCOME);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.WELCOME:
        return <Welcome onStart={startNewQuiz} />;
      case AppState.LOADING:
        return <Loading />;
      case AppState.QUIZ:
        return quizData ? <Quiz data={quizData} onComplete={handleQuizComplete} /> : null;
      case AppState.RESULTS:
        return quizData ? <Results data={quizData} userAnswers={userAnswers} onRetry={() => setAppState(AppState.WELCOME)} /> : null;
      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
             <div className="bg-red-100 p-4 rounded-full mb-4 text-red-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Generation Failed</h2>
             <p className="text-gray-600 mb-6 max-w-md mx-auto break-words text-sm bg-gray-100 p-2 rounded">{error}</p>
             <div className="flex flex-col gap-4 items-center">
               <div className="flex gap-4">
                  <button onClick={() => setAppState(AppState.WELCOME)} className="px-6 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">Back to Start</button>
                  <button onClick={handleDemoFallback} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Demo Mode</button>
               </div>
               
               {(error?.includes("Authentication") || error?.includes("API Key")) && window.aistudio && (
                 <button onClick={handleRetryKey} className="text-blue-600 font-bold underline mt-4">
                   Re-select Google API Key
                 </button>
               )}
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 selection:bg-blue-100">
      <header className="bg-blue-900 text-white shadow-xl z-50 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setAppState(AppState.WELCOME)}>
            <div className="bg-white p-1 rounded-lg"><svg className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <span className="font-black text-xl tracking-tighter">CA DMV <span className="text-yellow-400">PREP AI</span></span>
          </div>
          <div className="hidden sm:block text-xs font-bold uppercase tracking-widest text-blue-200">2025 Handbook Edition</div>
        </div>
      </header>
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">{renderContent()}</main>
      <footer className="bg-white border-t border-gray-100 py-8"><div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-xs font-medium uppercase tracking-widest"><p>© {new Date().getFullYear()} CA DMV Prep AI • Built with Gemini 3</p></div></footer>
    </div>
  );
};

export default App;