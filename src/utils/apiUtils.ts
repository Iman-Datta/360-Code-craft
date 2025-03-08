
import { SummaryItem, Question } from '../context/AppContext';

// Get API key from environment variables (using Vite's import.meta.env)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Interfaces for OpenAI API requests
interface OpenAICompletionRequest {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

// Check if API key is set
export const isApiKeySet = (): boolean => {
  return OPENAI_API_KEY !== '' && OPENAI_API_KEY !== 'your_openai_api_key_here';
};

// Function to generate a summary of PDF content using OpenAI's API
export const generateSummary = async (text: string): Promise<SummaryItem[]> => {
  console.log('Generating summary for text:', text.substring(0, 100) + '...');
  
  if (!isApiKeySet()) {
    console.warn('OpenAI API Key not set. Using mock data.');
    return getMockSummary();
  }
  
  try {
    const prompt = `
      Analyze the following text extracted from a PDF and create a structured summary.
      Format the summary into 3-5 sections with titles and bullet points.
      Each section should have a clear title and 3-5 concise bullet points highlighting key information.
      
      Text to summarize:
      ${text}
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that creates structured summaries from PDF content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      } as OpenAICompletionRequest)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const summaryText = data.choices[0].message.content;
    
    // Parse the summary text into structured format
    return parseSummaryText(summaryText);
  } catch (error) {
    console.error('Error generating summary:', error);
    return getMockSummary();
  }
};

// Function to generate quiz questions based on the summary using OpenAI's API
export const generateQuiz = async (summary: SummaryItem[]): Promise<Question[]> => {
  console.log('Generating quiz based on summary:', summary);
  
  if (!isApiKeySet()) {
    console.warn('OpenAI API Key not set. Using mock data.');
    return getMockQuestions();
  }
  
  try {
    // Convert summary to text format for the prompt
    const summaryText = summary.map(section => {
      return `${section.title}:
${section.points.map(point => `- ${point}`).join('\n')}`;
    }).join('\n\n');
    
    const prompt = `
      Based on the following summary, create 10 multiple-choice quiz questions.
      Each question should have 4 options with only 1 correct answer.
      Include an explanation for the correct answer.
      
      Format each question as follows:
      1. Question: [question text]
      2. Options:
         A. [option 1]
         B. [option 2]
         C. [option 3]
         D. [option 4]
      3. Correct Answer: [A, B, C, or D]
      4. Explanation: [brief explanation]
      
      Summary:
      ${summaryText}
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that creates educational quiz questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      } as OpenAICompletionRequest)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const quizText = data.choices[0].message.content;
    
    // Parse the quiz text into structured format
    return parseQuizText(quizText);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return getMockQuestions();
  }
};

// Helper function to parse the summary text from OpenAI into structured format
const parseSummaryText = (text: string): SummaryItem[] => {
  try {
    const sections: SummaryItem[] = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    let currentSection: SummaryItem | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a section title (not starting with bullet point markers)
      if (!trimmedLine.startsWith('-') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('*')) {
        // If we have a current section, add it to sections before creating a new one
        if (currentSection && currentSection.points.length > 0) {
          sections.push(currentSection);
        }
        
        // Create new section
        currentSection = {
          title: trimmedLine.replace(/[:.]$/, ''),
          points: []
        };
      } 
      // Check if this is a bullet point
      else if (currentSection) {
        // Extract the point text (remove bullet character and trim)
        const pointText = trimmedLine.replace(/^[-•*]\s*/, '');
        currentSection.points.push(pointText);
      }
    }
    
    // Add the last section if it exists
    if (currentSection && currentSection.points.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  } catch (error) {
    console.error('Error parsing summary text:', error);
    return getMockSummary();
  }
};

// Helper function to parse the quiz text from OpenAI into structured format
const parseQuizText = (text: string): Question[] => {
  try {
    const questions: Question[] = [];
    const questionBlocks = text.split(/\d+\.\s+Question:/).slice(1);
    
    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      
      // Extract question text
      const questionMatch = block.match(/(.+?)(?:Options:|$)/s);
      const questionText = questionMatch ? questionMatch[1].trim() : '';
      
      // Extract options
      const optionsMatch = block.match(/Options:([\s\S]+?)(?:Correct Answer:|$)/);
      const optionsText = optionsMatch ? optionsMatch[1].trim() : '';
      const optionsLines = optionsText.split(/\n/).map(line => line.trim()).filter(line => line.match(/^[A-D]\.\s+/));
      const options = optionsLines.map(line => line.replace(/^[A-D]\.\s+/, '').trim());
      
      // Extract correct answer
      const correctAnswerMatch = block.match(/Correct Answer:\s*([A-D])/);
      const correctAnswerLetter = correctAnswerMatch ? correctAnswerMatch[1] : 'A';
      const correctAnswer = ['A', 'B', 'C', 'D'].indexOf(correctAnswerLetter);
      
      // Extract explanation
      const explanationMatch = block.match(/Explanation:\s*(.+?)(?=\n\d+\.\s+Question:|$)/s);
      const explanation = explanationMatch ? explanationMatch[1].trim() : '';
      
      if (questionText && options.length === 4) {
        questions.push({
          question: questionText,
          options,
          correctAnswer,
          explanation
        });
      }
    }
    
    return questions.length > 0 ? questions : getMockQuestions();
  } catch (error) {
    console.error('Error parsing quiz text:', error);
    return getMockQuestions();
  }
};

// Fallback mock data
const getMockSummary = (): SummaryItem[] => {
  return [
    {
      title: "Main Concepts",
      points: [
        "Educational content is parsed from PDF documents for learning purposes",
        "Text extraction is performed to obtain readable content",
        "Natural language processing creates structured information",
        "Summarization focuses on key points and main ideas"
      ]
    },
    {
      title: "Key Benefits",
      points: [
        "Easy comprehension of complex materials",
        "Faster learning through organized bullet points",
        "Reinforcement through interactive quizzes",
        "Immediate feedback on understanding"
      ]
    },
    {
      title: "Learning Applications",
      points: [
        "Academic study and exam preparation",
        "Professional development and training",
        "Self-paced learning for various subjects",
        "Knowledge retention through testing"
      ]
    }
  ];
};

const getMockQuestions = (): Question[] => {
  return [
    {
      question: "What is the primary purpose of parsing PDFs in this application?",
      options: [
        "To modify the PDF structure",
        "To extract text for educational purposes",
        "To create new PDF documents",
        "To validate PDF authenticity"
      ],
      correctAnswer: 1,
      explanation: "The application parses PDFs to extract educational content that can be used for learning purposes."
    },
    {
      question: "Which process is used to create structured information from text?",
      options: [
        "Data validation",
        "Text compression",
        "Natural language processing",
        "Binary encoding"
      ],
      correctAnswer: 2,
      explanation: "Natural language processing techniques are used to transform raw text into structured, meaningful information."
    },
    {
      question: "What is the focus of the summarization process?",
      options: [
        "Grammar correction",
        "Key points and main ideas",
        "Document formatting",
        "File size reduction"
      ],
      correctAnswer: 1,
      explanation: "The summarization process focuses on extracting and presenting key points and main ideas from the content."
    },
    {
      question: "Which of the following is a stated benefit of the summarization feature?",
      options: [
        "Improved writing skills",
        "Enhanced document security",
        "Easier comprehension of complex materials",
        "Reduced storage requirements"
      ],
      correctAnswer: 2,
      explanation: "The summary helps users more easily comprehend complex materials by organizing information into digestible points."
    },
    {
      question: "How are quiz questions used in the learning process?",
      options: [
        "To grade users' performance",
        "To reinforce learning through testing",
        "To collect user data",
        "To generate new content"
      ],
      correctAnswer: 1,
      explanation: "Interactive quizzes reinforce learning by testing understanding and providing immediate feedback."
    },
    {
      question: "Which application of this platform would be most suitable for a college student?",
      options: [
        "Content creation",
        "Document storage",
        "Academic study and exam preparation",
        "Professional networking"
      ],
      correctAnswer: 2,
      explanation: "Academic study and exam preparation is explicitly mentioned as an application, making it most suitable for college students."
    },
    {
      question: "What does the platform provide immediately after a quiz question is answered?",
      options: [
        "New learning materials",
        "Peer comparison statistics",
        "Feedback on understanding",
        "Certificate of completion"
      ],
      correctAnswer: 2,
      explanation: "The platform provides immediate feedback on understanding when quiz questions are answered."
    },
    {
      question: "Which learning approach is supported by the platform's features?",
      options: [
        "Collaborative learning only",
        "Instructor-led training only",
        "Self-paced learning for various subjects",
        "Standardized testing preparation only"
      ],
      correctAnswer: 2,
      explanation: "Self-paced learning for various subjects is supported by the platform's features for individual study."
    },
    {
      question: "What type of content organization is used in the summary?",
      options: [
        "Chronological ordering",
        "Alphabetical sorting",
        "Bullet points for key concepts",
        "Random arrangement"
      ],
      correctAnswer: 2,
      explanation: "The summary is organized using bullet points to clearly present key concepts and facilitate easy reading."
    },
    {
      question: "Which cognitive process is primarily supported by the quiz feature?",
      options: [
        "Creativity",
        "Knowledge retention",
        "Social intelligence",
        "Physical coordination"
      ],
      correctAnswer: 1,
      explanation: "Knowledge retention through testing is specifically mentioned as a benefit of the quiz feature."
    }
  ];
};
