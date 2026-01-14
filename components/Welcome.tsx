import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { DifficultyLevel, QuestionStyle, QuizFocus, QuizConfig } from '../types';
import { getQuestionHistoryCount } from '../utils/history';

interface WelcomeProps {
  onStart: (config: QuizConfig) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('mix');
  const [style, setStyle] = useState<QuestionStyle>('mixed');
  const [focus, setFocus] = useState<QuizFocus>('mix');
  const [count, setCount] = useState<number>(25);
  const [historyCount, setHistoryCount] = useState(0);
  
  // API Key State for AI Studio environment
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    setHistoryCount(getQuestionHistoryCount());
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    // Check if we are in the AI Studio environment
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setNeedsApiKey(!hasKey);
    }
  };

  const handleConnectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success as per instructions and re-enable button
        setNeedsApiKey(false);
      } catch (e) {
        console.error("Failed to select key", e);
      }
    }
  };

  const handleStart = () => {
    onStart({
      difficulty,
      style,
      focus,
      questionCount: count
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-blue-600 text-white p-5 rounded-3xl mb-8 shadow-2xl rotate-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
        CA DMV <span className="text-blue-600 underline decoration-yellow-400">EXAM AI</span>
      </h1>
      <p className="text-gray-500 font-medium mb-8">AI-Powered Training Platform • 2025 Edition</p>

      {historyCount > 0 && (
         <div className="mb-8 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 text-sm font-bold animate-bounce">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
           {historyCount} UNIQUE QUESTIONS SEEN SO FAR
         </div>
      )}

      <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 mb-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hardness */}
          <div className="col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hardness Level</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50 font-bold"
            >
              <option value="mix">Mix (Balanced)</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Style */}
          <div className="col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Question Style</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value as QuestionStyle)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50 font-bold"
            >
              <option value="mixed">Mixed Styles</option>
              <option value="scenario">Scenario Based</option>
              <option value="straightforward">Straightforward</option>
            </select>
          </div>

          {/* Focus */}
          <div className="col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Topic Section</label>
            <select 
              value={focus}
              onChange={(e) => setFocus(e.target.value as QuizFocus)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50 font-bold"
            >
              <option value="mix">Mix All Topics</option>
              <option value="signs">Signs & Markings</option>
              <option value="numeric">Math Oriented</option>
              <option value="minors">Students Under 21</option>
              <option value="dui">Alcohol & DUI</option>
              <option value="fines">Fines & Penalties</option>
            </select>
          </div>

          {/* Count */}
          <div className="col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Question Count</label>
            <select 
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50 font-bold"
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="25">25 Questions</option>
              <option value="50">50 Questions</option>
              <option value="75">75 Questions</option>
              <option value="100">100 Questions</option>
            </select>
          </div>
        </div>
      </div>

      {needsApiKey ? (
         <Button onClick={handleConnectKey} className="text-xl px-16 py-5 rounded-2xl shadow-blue-200/50 shadow-2xl hover:-translate-y-1 animate-pulse">
           Connect Google API Key
         </Button>
      ) : (
         <Button onClick={handleStart} className="text-xl px-16 py-5 rounded-2xl shadow-blue-200/50 shadow-2xl hover:-translate-y-1">
           Generate New Exam
         </Button>
      )}
      
      <p className="mt-6 text-xs text-gray-400 font-bold tracking-widest uppercase">Verified 2025 Handbook Data</p>
    </div>
  );
};