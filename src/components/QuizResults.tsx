
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    // Calculate score with animation
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
    if (scorePercentage >= 80) return 'text-success';
    if (scorePercentage >= 60) return 'text-primary';
    if (scorePercentage >= 40) return 'text-orange-500';
    return 'text-destructive';
  };
  
  const handleRestartQuiz = () => {
    resetQuiz();
    setCurrentState('quiz');
  };
  
  const handleNewUpload = () => {
    setCurrentState('upload');
  };
  
  const handleDownload = () => {
    // Generate content for download
    let content = `# Summary and Quiz Results for ${fileName}\n\n`;
    
    // Add summary
    content += `## Summary\n\n`;
    summary.forEach((section, index) => {
      content += `### ${section.title}\n\n`;
      section.points.forEach(point => {
        content += `- ${point}\n`;
      });
      content += '\n';
    });
    
    // Add quiz results
    content += `## Quiz Results\n\n`;
    content += `Score: ${totalCorrect}/${questions.length} (${scorePercentage}%)\n`;
    content += `Correct answers: ${totalCorrect}\n`;
    content += `Incorrect answers: ${totalIncorrect}\n`;
    content += `Skipped questions: ${totalSkipped}\n\n`;
    
    // Add questions and answers
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
    
    // Download as text file
    downloadAsFile(content, `${fileName.replace('.pdf', '')}_summary_quiz.txt`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light mb-6">Quiz Results</h1>
            
            <div className="relative inline-block w-48 h-48 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#e5e7eb"
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
                <div className="flex items-center gap-1 text-success">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Correct</span>
                </div>
                <p className="text-xl font-medium">{totalCorrect}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 text-destructive">
                  <XCircleIcon className="h-4 w-4" />
                  <span>Incorrect</span>
                </div>
                <p className="text-xl font-medium">{totalIncorrect}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <HelpCircleIcon className="h-4 w-4" />
                  <span>Skipped</span>
                </div>
                <p className="text-xl font-medium">{totalSkipped}</p>
              </div>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Question Review</h2>
            
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(a => a.questionIndex === index);
              
              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    {userAnswer?.isCorrect ? (
                      <span className="text-success flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Correct
                      </span>
                    ) : userAnswer?.selectedOption === null ? (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <HelpCircleIcon className="h-4 w-4" />
                        Skipped
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1">
                        <XCircleIcon className="h-4 w-4" />
                        Incorrect
                      </span>
                    )}
                  </div>
                  
                  <p className="mb-3">{question.question}</p>
                  
                  <div className="space-y-2 mb-3">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = optIndex === question.correctAnswer;
                      const wasSelected = userAnswer?.selectedOption === optIndex;
                      
                      let optionClassName = "p-2 rounded text-sm flex items-center gap-2";
                      
                      if (isCorrect) {
                        optionClassName += " bg-success/10 text-success";
                      } else if (wasSelected) {
                        optionClassName += " bg-destructive/10 text-destructive";
                      } else {
                        optionClassName += " text-muted-foreground";
                      }
                      
                      return (
                        <div key={optIndex} className={optionClassName}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-success text-white' : wasSelected ? 'bg-destructive text-white' : 'border text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <div>{option}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-3 bg-secondary/30 rounded text-sm">
                    <div className="flex items-center gap-1 text-primary mb-1">
                      <HelpCircleIcon className="h-4 w-4" />
                      <span className="font-medium">Explanation</span>
                    </div>
                    <p className="text-muted-foreground">{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleNewUpload}
              className="transition-all gap-2"
            >
              <RotateCcwIcon className="h-4 w-4" />
              <span>Upload New PDF</span>
            </Button>
            
            <Button
              onClick={handleRestartQuiz}
              className="transition-all gap-2"
            >
              <RefreshCwIcon className="h-4 w-4" />
              <span>Retake Quiz</span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="transition-all gap-2"
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
