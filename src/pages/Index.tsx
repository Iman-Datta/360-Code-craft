import React from "react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import FileUpload from "@/components/FileUpload";
import Summary from "@/components/Summary";
import Quiz from "@/components/Quiz";
import QuizResults from "@/components/QuizResults";

const AppContent: React.FC = () => {
  const { currentState } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 transition-all">
      {/* Header with Rounded Logo */}
      <header className="py-6 px-4 flex flex-col items-center justify-center relative">
        {/* Logo with round styling */}
        <img 
          src="/logo.jpeg"  // Replace with the actual path
          alt="Gistify Logo" 
          className="absolute left-4 top-4 h-14 w-14 object-cover rounded-full border-4 border-blue-300 shadow-md" 
        />
        
        <h1 className="text-4xl font-bold tracking-wide text-blue-700 drop-shadow-md">
          Gistify
        </h1>
        <p className="text-blue-500 text-sm mt-1">
          Simplifying PDFs with AI-powered summaries & quizzes
        </p>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center pb-12">
        {currentState === "upload" && <FileUpload />}
        {currentState === "summary" && <Summary />}
        {currentState === "quiz" && <Quiz />}
        {currentState === "results" && <QuizResults />}
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-4 text-center text-sm text-blue-500">
        <p>📄 PDF Summary & Quiz Generator • Created with 💙 by Codezilla (IEM)</p>
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