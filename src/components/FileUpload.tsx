import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import { parsePDF } from '@/utils/pdfUtils';
import { generateSummary, isApiKeySet } from '@/utils/apiUtils';
import { FileUpIcon, FileTextIcon, ArrowRightIcon, AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const FileUpload: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [apiKeyWarning, setApiKeyWarning] = useState<boolean>(false);
  
  const { 
    setFileName,
    setFileContent,
    setSummary,
    setCurrentState,
    isProcessing,
    setIsProcessing
  } = useAppContext();

  useEffect(() => {
    setApiKeyWarning(!isApiKeySet());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      
      setFileName(file.name);
      const content = await parsePDF(file);
      setFileContent(content);
      
      const summaryData = await generateSummary(content);
      setSummary(summaryData);
      
      setCurrentState('summary');
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 bg-[#C3AC98] rounded-xl shadow-lg">
      <Card className="bg-[#B6ACA4] shadow-xl p-6 rounded-lg">
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-[#563925]/10 mb-4">
            <FileTextIcon className="h-8 w-8 text-[#563925]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#563925]">PDF Summary &amp; Quiz Generator</h1>
          <p className="text-[#3E3E3E] mt-2">Upload a PDF to generate a structured summary and quiz</p>
        </div>
        
        {apiKeyWarning && (
          <Alert className="mb-6 border-[#563925] bg-[#F5E7DA] text-[#563925]">
            <AlertCircleIcon className="h-4 w-4 mr-2" />
            <AlertDescription>
              OpenAI API key not found. Please set your API key in the <code>.env</code> file.
              Using mock data instead.
            </AlertDescription>
          </Alert>
        )}
        
        <div
          className={`border-2 border-dashed p-6 text-center transition-all rounded-lg cursor-pointer ${
            isDragging ? 'border-[#563925] bg-[#563925]/10' : 'border-gray-400'
          } ${file ? 'border-green-500 bg-green-100' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-full bg-[#563925]/10">
              <FileUpIcon className="h-8 w-8 text-[#563925]" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#563925]">
                {file ? file.name : "Drag & Drop your PDF here"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · PDF Document` : "or click to browse files"}
              </p>
              
              {!file && (
                <Button 
                  variant="outline" 
                  onClick={handleSelectFile}
                  className="mt-3 px-4 py-2 border-[#563925] text-[#563925] hover:bg-[#563925] hover:text-white transition-all"
                >
                  Choose File
                </Button>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
            </div>
          </div>
        </div>
        
        {file && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-2 text-white bg-[#563925] hover:bg-[#3E2A1F] transition-all rounded-lg flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span>Processing</span>
                  <div className="loading-dots">
                    <div className="w-1 h-1"></div>
                    <div className="w-1 h-1"></div>
                    <div className="w-1 h-1"></div>
                  </div>
                </>
              ) : (
                <>
                  <span>Submit</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FileUpload;