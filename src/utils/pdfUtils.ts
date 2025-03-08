import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';

// Set the worker source
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export interface PDFParseResult {
  text: string;
  info: {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    [key: string]: any;
  };
  metadata: any;
  numpages: number;
  numrender: number;
  version: string;
}

export const parsePDF = async (file: File): Promise<string> => {
  try {
    console.log('Processing PDF with PDF.js:', file.name);
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    console.log(`PDF has ${numPages} pages`);
    
    // Extract text from each page
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    console.log('PDF text extraction complete');
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF with PDF.js:', error);
    throw error;
  }
};

export const downloadAsFile = (
  content: string, 
  filename: string, 
  contentType: string = 'text/plain'
) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
