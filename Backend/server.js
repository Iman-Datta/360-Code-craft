require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const cors = require('cors');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 5000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(cors());

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload PDF & Extract Text
app.post('/upload', upload.single('pdf'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const text = await pdfParse(req.file.buffer);
        const extractedText = text.text.trim();
        if (!extractedText) return res.status(400).json({ error: 'Empty PDF content' });

        // Summarize with OpenAI
        const summary = await generateSummary(extractedText);
        res.json({ summary });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: 'Error extracting text' });
    }
});

// Generate Summary
async function generateSummary(text) {
    const prompt = `Summarize the following text in bullet points:\n\n${text}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5
    });
    return response.choices[0].message.content;
}

// Generate Quiz
app.post('/generate-quiz', async (req, res) => {
    const { summary } = req.body;
    if (!summary) return res.status(400).json({ error: 'No summary provided' });

    try {
        const quiz = await generateQuiz(summary);
        res.json({ quiz });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Quiz generation failed' });
    }
});

async function generateQuiz(summary) {
    const prompt = `Create a 10-question multiple-choice quiz based on the following summary. Format: JSON with "questions" (array of objects), each containing "question", "options" (array of 4), and "answer":\n\n${summary}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content);
}

// Download Summary & Quiz as PDF
app.post('/download-pdf', (req, res) => {
    const { summary, quiz } = req.body;
    if (!summary || !quiz) return res.status(400).json({ error: 'Missing data' });

    const doc = new PDFDocument();
    const filename = `summary_quiz.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(16).text('Summary:', { underline: true }).moveDown();
    doc.fontSize(12).text(summary).moveDown(2);

    doc.fontSize(16).text('Quiz:', { underline: true }).moveDown();
    quiz.questions.forEach((q, index) => {
        doc.fontSize(12).text(`${index + 1}. ${q.question}`).moveDown(0.5);
        q.options.forEach((opt, i) => doc.text(`   ${String.fromCharCode(65 + i)}. ${opt}`).moveDown(0.2));
        doc.moveDown(1);
    });

    doc.end();
});

app.listen(port, () => console.log(`Server running on port ${port}`));