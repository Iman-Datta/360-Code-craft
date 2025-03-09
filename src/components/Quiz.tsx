import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from '@/context/AppContext';
import Timer from './Timer';
import { HelpCircleIcon, ArrowRightIcon, CheckIcon, XIcon } from 'lucide-react';

const Quiz: React.FC = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    userAnswers,
    addUserAnswer,
    setCurrentState
  } = useAppContext();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsTimerActive(true);
    
    const existingAnswer = userAnswers.find(a => a.questionIndex === currentQuestionIndex);
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selectedOption);
      setIsAnswerSubmitted(true);
      setIsTimerActive(false);
    }
  }, [currentQuestionIndex, userAnswers]);
  
  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };
  
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    addUserAnswer({
      questionIndex: currentQuestionIndex,
      selectedOption,
      isCorrect
    });
    
    setIsAnswerSubmitted(true);
    setIsTimerActive(false);
  };
  
  const handleSkip = () => {
    addUserAnswer({
      questionIndex: currentQuestionIndex,
      selectedOption: null,
      isCorrect: false
    });
    
    moveToNextQuestion();
  };
  
  const handleTimeout = () => {
    addUserAnswer({
      questionIndex: currentQuestionIndex,
      selectedOption: null,
      isCorrect: false
    });
    
    moveToNextQuestion();
  };
  
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentState('results');
    }
  };
  
  const getOptionClassName = (index: number) => {
    let className = "answer-option border rounded-lg px-4 py-3 relative cursor-pointer transition-all";
    
    if (isAnswerSubmitted) {
      if (index === currentQuestion.correctAnswer) {
        className += " border-green-500 bg-[#B6ACA4]/20";
      } else if (index === selectedOption) {
        className += " border-red-500 bg-[#C3AC98]/20";
      }
    } else if (index === selectedOption) {
      className += " bg-[#C3AC98] text-[#563925] border-[#563925]";
    } else {
      className += " border-[#C3AC98]";
    }
    
    return className;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="glass-card overflow-hidden bg-[#B6ACA4] border border-[#563925]">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-[#C3AC98]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <Progress value={progress} className="w-32 h-2 mt-1 bg-[#C3AC98]" />
            </div>
            
            <Timer duration={30} onTimeout={handleTimeout} isActive={isTimerActive} />
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-6 text-[#563925]">{currentQuestion.question}</h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={getOptionClassName(index)}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${selectedOption === index ? 'bg-[#563925] text-[#C3AC98]' : 'border-[#563925]'}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="text-[#563925]">{option}</div>
                  </div>
                  
                  {isAnswerSubmitted && index === currentQuestion.correctAnswer && (
                    <div className="absolute right-4 top-4">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  
                  {isAnswerSubmitted && index === selectedOption && index !== currentQuestion.correctAnswer && (
                    <div className="absolute right-4 top-4">
                      <XIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {isAnswerSubmitted && (
            <div className="mb-6 p-4 border rounded-lg bg-[#C3AC98]/50 animate-scale-in">
              <div className="flex items-start gap-2 mb-2">
                <HelpCircleIcon className="h-5 w-5 text-[#563925] mt-0.5" />
                <h3 className="font-medium text-[#563925]">Explanation</h3>
              </div>
              <p className="text-[#563925]">{currentQuestion.explanation}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            {!isAnswerSubmitted ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  className="transition-all border-[#563925] text-[#563925] hover:bg-[#C3AC98]"
                >
                  Skip
                </Button>
                
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="transition-all bg-[#563925] text-[#C3AC98] hover:bg-[#C3AC98] hover:text-[#563925]"
                >
                  Submit Answer
                </Button>
              </>
            ) : (
              <Button
                onClick={moveToNextQuestion}
                className="transition-all ml-auto gap-2 bg-[#563925] text-[#C3AC98] hover:bg-[#C3AC98] hover:text-[#563925]"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>View Results</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Quiz;