import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { parsePDF } from "@/utils/pdfUtils";
import { generateSummary, isApiKeySet } from "@/utils/apiUtils";
import { FileUpIcon, FileTextIcon, ArrowRightIcon, AlertCircleIcon } from "lucide-react";
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
    setIsProcessing,
  } = useAppContext();

  useEffect(() => {
    setApiKeyWarning(!isApiKeySet());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
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
      if (droppedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
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
      setCurrentState("summary");
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 animate-fade-in bg-white rounded-xl shadow-2xl">
      <Card className="glass-card overflow-hidden bg-white border border-gray-300 shadow-md">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-3 rounded-full bg-blue-200 mb-4 shadow-sm">
              <FileTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              Gistify - PDF Summary &amp; Quiz Generator
            </h1>
            <p className="text-gray-500">Upload a PDF to generate a structured summary and quiz</p>
          </div>

          {/* API Key Warning */}
          {apiKeyWarning && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50 text-yellow-800">
              <AlertCircleIcon className="h-4 w-4 mr-2" />
              <AlertDescription>
                OpenAI API key not found. Please set your API key in the <code>.env</code> file.
                Using mock data instead.
              </AlertDescription>
            </Alert>
          )}

          {/* File Upload Box */}
          <div
            className={`w-full h-64 py-16 px-8 rounded-lg shadow-md border-2 border-dashed 
             ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-100"}
             ${file ? "border-green-500 bg-green-50" : ""} transition-all duration-300 ease-in-out`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-blue-400 shadow-md">
                <FileUpIcon className="h-8 w-8 text-white" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1 text-gray-700">
                  {file ? file.name : "Drag & Drop your PDF here"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB · PDF Document`
                    : "or click to browse files"}
                </p>

                {!file && (
                  <Button
                    variant="outline"
                    onClick={handleSelectFile}
                    className="smooth-transition border-blue-400 text-blue-500 hover:bg-blue-500 hover:text-white"
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

          {/* Submit Button */}
          {file && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="smooth-transition gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <span>Processing</span>
                    <div className="loading-dots flex gap-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
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