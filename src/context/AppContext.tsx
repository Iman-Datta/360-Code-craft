
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Application state type
type AppState = 'upload' | 'summary' | 'quiz' | 'results';

// Summary item interface
export interface SummaryItem {
  title: string;
  points: string[];
}

// Question interface
export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// User answer interface
export interface UserAnswer {
  questionIndex: number;
  selectedOption: number | null;
  isCorrect: boolean;
}

// App context interface
interface AppContextType {
  currentState: AppState;
  setCurrentState: (state: AppState) => void;
  fileName: string;
  setFileName: (name: string) => void;
  fileContent: string;
  setFileContent: (content: string) => void;
  summary: SummaryItem[];
  setSummary: (summary: SummaryItem[]) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: UserAnswer[];
  setUserAnswers: (answers: UserAnswer[]) => void;
  addUserAnswer: (answer: UserAnswer) => void;
  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
  resetQuiz: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const addUserAnswer = (answer: UserAnswer) => {
    setUserAnswers(prev => {
      // Check if this question was already answered
      const existingIndex = prev.findIndex(a => a.questionIndex === answer.questionIndex);
      
      if (existingIndex !== -1) {
        // Replace the existing answer
        const updated = [...prev];
        updated[existingIndex] = answer;
        return updated;
      } else {
        // Add new answer
        return [...prev, answer];
      }
    });
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentState,
        setCurrentState,
        fileName,
        setFileName,
        fileContent,
        setFileContent,
        summary,
        setSummary,
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        userAnswers,
        setUserAnswers,
        addUserAnswer,
        isProcessing,
        setIsProcessing,
        resetQuiz
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
