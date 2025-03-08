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
    // Check if API key is set
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
      
      // Set file name for display
      setFileName(file.name);
      
      // Parse PDF content
      const content = await parsePDF(file);
      setFileContent(content);
      
      // Generate summary
      const summaryData = await generateSummary(content);
      setSummary(summaryData);
      
      // Move to summary state
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
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <FileTextIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-light mb-2">PDF Summary &amp; Quiz Generator</h1>
            <p className="text-muted-foreground">
              Upload a PDF to generate a structured summary and quiz
            </p>
          </div>
          
          {apiKeyWarning && (
            <Alert className="mb-6 border-amber-500 bg-amber-50 text-amber-800">
              <AlertCircleIcon className="h-4 w-4 mr-2" />
              <AlertDescription>
                OpenAI API key not found. Please set your API key in the <code>.env</code> file. 
                Using mock data instead.
              </AlertDescription>
            </Alert>
          )}
          
          <div
            className={`upload-area ${isDragging ? 'border-primary bg-primary/10' : ''} ${file ? 'border-success bg-success/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-secondary">
                <FileUpIcon className="h-8 w-8 text-primary" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">
                  {file ? file.name : "Drag & Drop your PDF here"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {file 
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB · PDF Document` 
                    : "or click to browse files"}
                </p>
                
                {!file && (
                  <Button 
                    variant="outline" 
                    onClick={handleSelectFile}
                    className="smooth-transition"
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
                className="smooth-transition gap-2"
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
        </div>
      </Card>
    </div>
  );
};

export default FileUpload;
