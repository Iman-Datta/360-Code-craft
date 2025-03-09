Gistify: PDF Summarizer & Quiz Generator

Gistify is a web-based platform that uses AI to help users extract key insights from PDFs, generating structured summaries and quizzes to streamline the learning process.

Key Features:

- PDF Upload: Easily upload PDF files via drag-and-drop or manual selection.
- Text Extraction: Utilizes pdf-parse to extract content from PDFs.
- AI Summarization: Leveraging OpenAI's GPT API to generate concise, bullet-point summaries.
- MCQ Generation: Automatically creates 10 multiple-choice questions based on the summary.
- Instant Feedback: Color-coded response indicators for correct/incorrect answers.
- Timer per Question: 30-second countdown per question, auto-skipping on timeout.
- Results & Explanations: Detailed results page with explanations for each question.
- Downloadable Reports: Summaries and quizzes can be downloaded as PDFs.

Tech Stack:

- Frontend: React for UI development, Tailwind CSS for styling, and Shadcn/ui for components.
- Backend: Node.js & Express for API handling, Firebase Firestore for database storage, pdf-parse for text extraction, and OpenAI GPT API for summarization & quiz generation.