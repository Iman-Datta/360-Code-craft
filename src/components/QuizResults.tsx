import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from '@/context/AppContext';
import { downloadAsFile } from '@/utils/pdfUtils';
import { CheckCircleIcon, XCircleIcon, HelpCircleIcon, RefreshCwIcon, DownloadIcon, RotateCcwIcon } from 'lucide-react';

const QuizResults: React.FC = () => {
  const { 
    fileName,
    summary,
    questions, 
    userAnswers,
    resetQuiz,
    setCurrentState
  } = useAppContext();
  
  const [scorePercentage, setScorePercentage] = useState<number>(0);
  
  useEffect(() => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const targetPercentage = Math.round((correctAnswers / questions.length) * 100);
    
    let currentPercentage = 0;
    const interval = setInterval(() => {
      if (currentPercentage >= targetPercentage) {
        clearInterval(interval);
        return;
      }
      
      currentPercentage += 1;
      setScorePercentage(currentPercentage);
    }, 20);
    
    return () => clearInterval(interval);
  }, [userAnswers, questions.length]);
  
  const totalCorrect = userAnswers.filter(answer => answer.isCorrect).length;
  const totalSkipped = userAnswers.filter(answer => answer.selectedOption === null).length;
  const totalIncorrect = userAnswers.length - totalCorrect - totalSkipped;
  
  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'text-[#563925]';
    if (scorePercentage >= 60) return 'text-[#C3AC98]';
    if (scorePercentage >= 40) return 'text-[#B6ACA4]';
    return 'text-red-600';
  };
  
  const handleRestartQuiz = () => {
    resetQuiz();
    setCurrentState('quiz');
  };
  
  const handleNewUpload = () => {
    setCurrentState('upload');
  };
  
  const handleDownload = () => {
    let content = `# Summary and Quiz Results for ${fileName}\n\n`;
    
    content += `## Summary\n\n`;
    summary.forEach((section, index) => {
      content += `### ${section.title}\n\n`;
      section.points.forEach(point => {
        content += `- ${point}\n`;
      });
      content += '\n';
    });
    
    content += `## Quiz Results\n\n`;
    content += `Score: ${totalCorrect}/${questions.length} (${scorePercentage}%)\n`;
    content += `Correct answers: ${totalCorrect}\n`;
    content += `Incorrect answers: ${totalIncorrect}\n`;
    content += `Skipped questions: ${totalSkipped}\n\n`;
    
    content += `## Questions and Answers\n\n`;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers.find(a => a.questionIndex === index);
      
      content += `### Question ${index + 1}: ${question.question}\n\n`;
      
      question.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === question.correctAnswer;
        const wasSelected = userAnswer?.selectedOption === optIndex;
        
        let marker = ' ';
        if (isCorrect) marker = '✓';
        if (wasSelected && !isCorrect) marker = '✗';
        
        content += `${marker} ${String.fromCharCode(65 + optIndex)}. ${option}\n`;
      });
      
      content += `\nExplanation: ${question.explanation}\n\n`;
      
      if (userAnswer?.selectedOption === null) {
        content += `You skipped this question.\n\n`;
      } else if (userAnswer?.isCorrect) {
        content += `Your answer was correct.\n\n`;
      } else {
        content += `Your answer was incorrect.\n\n`;
      }
      
      content += `---\n\n`;
    });
    
    downloadAsFile(content, `${fileName.replace('.pdf', '')}_summary_quiz.txt`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="bg-[#B6ACA4] text-[#563925] shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light mb-6 text-[#563925]">Quiz Results</h1>
            
            <div className="relative inline-block w-48 h-48 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#C3AC98"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * scorePercentage) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className={getScoreColor()}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-medium ${getScoreColor()}`}>
                  {scorePercentage}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#563925]">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Correct</span>
                </div>
                <p className="text-xl font-medium">{totalCorrect}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 text-red-600">
                  <XCircleIcon className="h-4 w-4" />
                  <span>Incorrect</span>
                </div>
                <p className="text-xl font-medium">{totalIncorrect}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 text-gray-500">
                  <HelpCircleIcon className="h-4 w-4" />
                  <span>Skipped</span>
                </div>
                <p className="text-xl font-medium">{totalSkipped}</p>
              </div>
            </div>
          </div>
          
          <Separator className="mb-8 border-[#C3AC98]" />
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleNewUpload}
              className="transition-all gap-2 border-[#563925] text-[#563925]"
            >
              <RotateCcwIcon className="h-4 w-4" />
              <span>Upload New PDF</span>
            </Button>
            
            <Button
              onClick={handleRestartQuiz}
              className="transition-all gap-2 bg-[#563925] text-white"
            >
              <RefreshCwIcon className="h-4 w-4" />
              <span>Retake Quiz</span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="transition-all gap-2 bg-[#C3AC98] text-[#563925]"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download Summary & Quiz</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizResults;