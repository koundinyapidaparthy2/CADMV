
export interface Question {
  questionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: string;
  questionImageUrl?: string; // Optional URL for a sign or scenario image
  optionImageUrls?: string[]; // Optional array of URLs if options are visual
}

export interface QuizData {
  quizTitle: string;
  totalQuestions: number;
  questions: Question[];
}

export enum AppState {
  WELCOME = 'WELCOME',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface UserAnswers {
  [questionId: string]: string; // Maps questionId to selected option string
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mix';

export type QuestionStyle = 'scenario' | 'straightforward' | 'mixed';

export type QuizFocus = 
  | 'mix' 
  | 'numeric'     // Math oriented
  | 'minors'      // Under 21
  | 'dui'         // Alcohol & Drugs
  | 'signs'       // Signs & Signals
  | 'fines';      // Penalties & Fines

export interface QuizConfig {
  difficulty: DifficultyLevel;
  style: QuestionStyle;
  focus: QuizFocus;
  questionCount: number;
}

// Global declaration for AI Studio bridge
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey(): Promise<boolean>;
      openSelectKey(): Promise<void>;
    };
  }
}
