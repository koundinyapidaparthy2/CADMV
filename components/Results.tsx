import React, { useMemo, useEffect } from 'react';
import { QuizData, UserAnswers } from '../types';
import { Button } from './Button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { saveQuestionsToHistory } from '../utils/history';

interface ResultsProps {
  data: QuizData;
  userAnswers: UserAnswers;
  onRetry: () => void;
}

export const Results: React.FC<ResultsProps> = ({ data, userAnswers, onRetry }) => {
  useEffect(() => {
    saveQuestionsToHistory(data.questions);
  }, [data]);

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    data.questions.forEach(q => {
      const answer = userAnswers[q.questionId];
      if (!answer) unanswered++;
      else if (answer === q.correctAnswer) correct++;
      else incorrect++;
    });
    const score = Math.round((correct / data.totalQuestions) * 100);
    const passed = score >= 83;
    return { correct, incorrect, unanswered, score, passed };
  }, [data, userAnswers]);

  const chartData = [
    { name: 'Correct', value: stats.correct, color: '#16a34a' },
    { name: 'Incorrect', value: stats.incorrect, color: '#dc2626' },
    { name: 'Unanswered', value: stats.unanswered, color: '#9ca3af' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
        <div className={`p-10 text-white text-center ${stats.passed ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="mb-4 inline-block bg-white/20 p-4 rounded-full">
            {stats.passed ? (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <h2 className="text-4xl font-black mb-2">{stats.passed ? 'EXAM PASSED!' : 'EXAM FAILED'}</h2>
          <p className="text-xl font-medium opacity-90">{stats.score}% Score • Passing is 83%</p>
        </div>
        
        <div className="p-10 flex flex-col md:flex-row items-center gap-12">
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-100 text-center">
                 <div className="text-4xl font-black text-green-700">{stats.correct}</div>
                 <div className="text-xs text-green-600 uppercase font-black tracking-widest mt-1">Correct</div>
               </div>
               <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 text-center">
                 <div className="text-4xl font-black text-red-700">{stats.incorrect}</div>
                 <div className="text-xs text-red-600 uppercase font-black tracking-widest mt-1">Wrong</div>
               </div>
             </div>
             <Button onClick={onRetry} fullWidth className="text-lg py-5">Try Another Version</Button>
          </div>
        </div>
      </div>

      <h3 className="text-3xl font-black text-gray-900 mb-8 ml-2 italic">REVIEW SESSION</h3>
      <div className="space-y-8">
        {data.questions.map((q, idx) => {
          const userAnswer = userAnswers[q.questionId];
          const isCorrect = userAnswer === q.correctAnswer;
          return (
            <div key={q.questionId} className={`bg-white rounded-2xl shadow-md border-l-8 overflow-hidden transition-transform hover:scale-[1.01] ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-black">Q{idx + 1}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{q.difficulty}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-6">{q.question}</h4>
                
                {q.questionImageUrl && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-center">
                        <img src={q.questionImageUrl} alt="Sign" className="max-h-32 object-contain rounded shadow-sm" />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, i) => {
                    const isSelected = userAnswer === opt;
                    const isTheCorrectOne = opt === q.correctAnswer;
                    const hasImage = q.optionImageUrls && q.optionImageUrls[i];
                    
                    let style = "border-gray-100 bg-gray-50 text-gray-400";
                    if (isTheCorrectOne) style = "border-green-500 bg-green-50 text-green-800 font-bold";
                    else if (isSelected) style = "border-red-500 bg-red-50 text-red-800 font-bold";

                    return (
                      <div key={i} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${style}`}>
                        {hasImage && <img src={q.optionImageUrls![i]} alt="option" className="h-16 object-contain mb-1" />}
                        <span className="text-sm text-center">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};