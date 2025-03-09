import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from '@/context/AppContext';
import { generateQuiz } from '@/utils/apiUtils';
import { BookIcon, BrainIcon } from 'lucide-react';

const Summary: React.FC = () => {
  const { toast } = useToast();
  const { 
    fileName, 
    summary, 
    setQuestions, 
    setCurrentState,
    isProcessing,
    setIsProcessing
  } = useAppContext();

  const handleGenerateQuiz = async () => {
    try {
      setIsProcessing(true);
      
      // Generate questions based on summary
      const quizQuestions = await generateQuiz(summary);
      setQuestions(quizQuestions);
      
      // Move to quiz state
      setCurrentState('quiz');
      
      toast({
        title: "Quiz Generated",
        description: "Your quiz is ready. Answer all questions to complete the quiz.",
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Generation Error",
        description: "There was an error generating the quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="glass-card overflow-hidden bg-[#B6ACA4] border border-[#563925]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-[#563925]/10">
              <BookIcon className="h-5 w-5 text-[#563925]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[#563925]">Summary</h2>
              <p className="text-sm text-[#C3AC98]">Generated from {fileName}</p>
            </div>
          </div>
          
          <Separator className="mb-6 border-[#563925]" />
          
          <div className="space-y-8 mb-8">
            {summary.map((section, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="mb-3">
                  <Badge variant="outline" className="bg-[#C3AC98] text-[#563925] mb-2">
                    Section {index + 1}
                  </Badge>
                  <h3 className="text-xl font-medium text-[#563925]">{section.title}</h3>
                </div>
                
                <ul className="space-y-2 pl-6">
                  {section.points.map((point, pointIndex) => (
                    <li 
                      key={pointIndex} 
                      className="list-disc text-[#563925] animate-slide-up" 
                      style={{ animationDelay: `${(index * 100) + (pointIndex * 50)}ms` }}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setCurrentState('upload')}
              className="transition-all border-[#563925] text-[#563925] hover:bg-[#C3AC98]"
            >
              Upload Another PDF
            </Button>
            
            <Button
              onClick={handleGenerateQuiz}
              disabled={isProcessing}
              className="transition-all gap-2 bg-[#563925] text-[#C3AC98] hover:bg-[#C3AC98] hover:text-[#563925]"
            >
              {isProcessing ? (
                <>
                  <span>Generating Quiz</span>
                  <div className="loading-dots">
                    <div className="w-1 h-1 bg-[#C3AC98]"></div>
                    <div className="w-1 h-1 bg-[#C3AC98]"></div>
                    <div className="w-1 h-1 bg-[#C3AC98]"></div>
                  </div>
                </>
              ) : (
                <>
                  <span>Generate Quiz</span>
                  <BrainIcon className="h-4 w-4 text-[#C3AC98]" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Summary;