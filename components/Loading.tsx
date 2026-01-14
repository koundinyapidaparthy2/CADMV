import React, { useEffect, useState } from 'react';

export const Loading: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) return 100;
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 99);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Your Exam...</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Our AI is reading the handbook and crafting 50 unique questions for you. This usually takes about 10-20 seconds.
      </p>

      <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-gray-400 font-mono">{Math.floor(progress)}%</p>
    </div>
  );
};