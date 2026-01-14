import React, { useState, useMemo, useEffect } from 'react';
import { QuizData, UserAnswers } from '../types';
import { Button } from './Button';

interface QuizProps {
  data: QuizData;
  onComplete: (answers: UserAnswers) => void;
}

export const Quiz: React.FC<QuizProps> = ({ data, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const question = data.questions[currentIndex];
  const isLastQuestion = currentIndex === data.questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const selectedOption = answers[question.questionId];
  const isAnswered = !!selectedOption;

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    Object.entries(answers).forEach(([qId, userAns]) => {
       const q = data.questions.find(q => q.questionId === qId);
       if (q) {
         if (userAns === q.correctAnswer) correct++;
         else incorrect++;
       }
    });
    return { correct, incorrect };
  }, [answers, data.questions]);

  const totalAnswered = stats.correct + stats.incorrect;
  const percentage = totalAnswered > 0 ? Math.round((stats.correct / totalAnswered) * 100) : 100;

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [question.questionId]: option }));
  };

  const handleNext = () => isLastQuestion ? onComplete(answers) : setCurrentIndex(prev => prev + 1);
  const handlePrev = () => !isFirstQuestion && setCurrentIndex(prev => prev - 1);

  const handleImageError = (id: string) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Reset image state when navigating
  useEffect(() => {
    setImageError({});
    setImageLoaded({});
  }, [currentIndex]);

  const hasQuestionImage = !!question.questionImageUrl && !imageError[`q-${question.questionId}`];

  return (
    <div className="max-w-5xl mx-auto w-full pb-20 px-4">
      {/* Real-time Dashboard */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 mb-6 flex flex-wrap justify-between items-center sticky top-2 z-40 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xl font-bold border border-blue-100">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {formatTime(timeElapsed)}
          </div>
        </div>

        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="flex gap-4">
                    <span className="text-green-600 font-black">✓ {stats.correct}</span>
                    <span className="text-red-600 font-black">✗ {stats.incorrect}</span>
                </div>
                <div className={`ml-4 px-5 py-2 rounded-2xl text-2xl font-black border-2 transition-colors ${percentage >= 83 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {percentage}%
                </div>
             </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="w-full bg-gray-100 h-2">
          <div className="bg-blue-600 h-2 transition-all duration-500" style={{ width: `${((currentIndex + 1) / data.totalQuestions) * 100}%` }}></div>
        </div>

        <div className="p-8 md:p-14">
          <div className="flex justify-between items-center mb-10">
             <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="text-xs font-bold text-gray-400 tracking-tighter uppercase">Question {currentIndex + 1} / {data.totalQuestions}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-10">
            {question.question}
          </h2>

          {hasQuestionImage && (
            <div className="mb-10 flex flex-col items-center justify-center bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 shadow-inner relative min-h-[160px]">
               {!imageLoaded[`q-${question.questionId}`] && (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold animate-pulse">
                   Loading Sign Asset...
                 </div>
               )}
               <img 
                 src={question.questionImageUrl} 
                 alt="Sign Illustration" 
                 className={`max-h-72 object-contain rounded-xl drop-shadow-2xl transition-all duration-500 ${imageLoaded[`q-${question.questionId}`] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                 onLoad={() => handleImageLoad(`q-${question.questionId}`)}
                 onError={() => handleImageError(`q-${question.questionId}`)}
               />
            </div>
          )}

          <div className={`grid gap-5 ${question.optionImageUrls ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === question.correctAnswer;
              const hasOptImage = question.optionImageUrls && question.optionImageUrls[idx] && !imageError[`opt-${idx}`];
              
              let containerClass = "border-2 border-gray-100 bg-white hover:border-blue-400 hover:shadow-xl text-gray-700";
              
              if (isAnswered) {
                  if (isCorrect) containerClass = "border-green-500 bg-green-50 text-green-900 scale-[1.02] z-10 shadow-lg ring-4 ring-green-100";
                  else if (isSelected) containerClass = "border-red-500 bg-red-50 text-red-900 ring-4 ring-red-100";
                  else containerClass = "border-gray-50 bg-gray-50/50 text-gray-300 opacity-40 grayscale";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`text-left rounded-3xl transition-all duration-300 p-6 flex flex-col h-full ${containerClass}`}
                >
                  {hasOptImage && (
                    <div className="w-full h-40 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center p-2 overflow-hidden border border-gray-100 relative">
                        {!imageLoaded[`opt-${idx}`] && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300">Loading...</div>}
                        <img 
                        src={question.optionImageUrls![idx]} 
                        alt="Option Sign" 
                        className={`max-h-full object-contain transition-opacity duration-300 ${imageLoaded[`opt-${idx}`] ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => handleImageLoad(`opt-${idx}`)}
                        onError={() => handleImageError(`opt-${idx}`)}
                        />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm mt-1 ${isAnswered && isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-bold text-lg leading-snug">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {isAnswered && (
             <div className={`mt-12 p-8 rounded-[2rem] border-4 text-center animate-in zoom-in-95 duration-300 ${selectedOption === question.correctAnswer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                 <p className="text-2xl font-black mb-1">{selectedOption === question.correctAnswer ? "PERFECT! ✓" : "WRONG! ✗"}</p>
                 <p className="text-lg font-bold opacity-80">{selectedOption === question.correctAnswer ? "You truly know the handbook." : `The correct answer is: ${question.correctAnswer}`}</p>
             </div>
          )}
        </div>

        <div className="px-8 py-8 md:px-14 md:py-10 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <Button variant="secondary" onClick={handlePrev} disabled={isFirstQuestion} className="rounded-2xl border-2">Previous</Button>
          <Button onClick={handleNext} disabled={!isAnswered} className="rounded-2xl px-12">
            {isLastQuestion ? 'Review Final Score' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};