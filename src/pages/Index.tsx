import React from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import FileUpload from '@/components/FileUpload';
import Summary from '@/components/Summary';
import Quiz from '@/components/Quiz';
import QuizResults from '@/components/QuizResults';

const AppContent: React.FC = () => {
  const { currentState } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200 transition-all">
      {/* Header with Image Logo */}
      <header className="py-6 px-4 flex items-center justify-center relative">
        {/* Logo positioned in the top-left corner */}
        <img 
          src="/logo.jpeg"  // Replace with the actual path after uploading the image
          alt="Gistify Logo" 
          className="absolute left-4 top-4 h-12 w-12 object-contain" 
        />
        
        <h1 className="text-3xl font-semibold tracking-wide text-indigo-700">Gistify</h1>
      </header>
      
      <main className="flex-1 flex items-center justify-center pb-12">
        {currentState === 'upload' && <FileUpload />}
        {currentState === 'summary' && <Summary />}
        {currentState === 'quiz' && <Quiz />}
        {currentState === 'results' && <QuizResults />}
      </main>
      
      <footer className="py-4 px-4 text-center text-sm text-gray-500">
        <p>PDF Summary & Quiz Generator • Created with Codezilla (IEM)</p>
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
