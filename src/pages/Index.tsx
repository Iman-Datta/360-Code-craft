
import React from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import FileUpload from '@/components/FileUpload';
import Summary from '@/components/Summary';
import Quiz from '@/components/Quiz';
import QuizResults from '@/components/QuizResults';

const AppContent: React.FC = () => {
  const { currentState } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 transition-all">
      <header className="py-6 px-4 text-center">
        <h1 className="text-2xl font-light tracking-wide text-primary">Quizly</h1>
      </header>
      
      <main className="flex-1 flex items-center justify-center pb-12">
        {currentState === 'upload' && <FileUpload />}
        {currentState === 'summary' && <Summary />}
        {currentState === 'quiz' && <Quiz />}
        {currentState === 'results' && <QuizResults />}
      </main>
      
      <footer className="py-4 px-4 text-center text-sm text-muted-foreground">
        <p>PDF Summary & Quiz Generator • Created with Lovable</p>
      </footer>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
