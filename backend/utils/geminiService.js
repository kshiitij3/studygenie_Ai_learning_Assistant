import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { chunkText } from './textChunker.js';

dotenv.config();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

/**
 * Deduplicate flashcards based on similarity
 * @param {Array<Object>} cards - Array of flashcard objects
 * @returns {Array<Object>}
 */
const deduplicateFlashcards = (cards) => {
  const unique = [];
  const questionSet = new Set();

  for (const card of cards) {
    const normalizedQ = card.question.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // Check if similar question already exists
    const isDuplicate = Array.from(questionSet).some(existingQ => {
      const existingNorm = existingQ.toLowerCase().replace(/[^\w\s]/g, '').trim();
      // Simple similarity check - if 70% of words match, consider duplicate
      const existingWords = new Set(existingNorm.split(/\s+/));
      const currentWords = normalizedQ.split(/\s+/);
      const matches = currentWords.filter(w => existingWords.has(w)).length;
      const similarity = matches / Math.max(existingWords.size, currentWords.length);
      return similarity > 0.7;
    });

    if (!isDuplicate) {
      unique.push(card);
      questionSet.add(card.question);
    }
  }

  return unique;
};

/**
 * Generate flashcards from text chunks (improved version)
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */

export const generateFlashcards = async (text, count = 10) => {
  // Split text into chunks for comprehensive coverage
  const chunks = chunkText(text, 800, 100);
  
  // If text is short, use old method
  if (chunks.length === 0 || text.length < 2000) {
    return generateFlashcardsFromText(text, count);
  }

  const cardsPerChunk = Math.ceil(count / chunks.length);
  const allCards = [];

  try {
    // Generate flashcards from each chunk in parallel
    const chunkPromises = chunks.map(chunk =>
      generateFlashcardsFromText(chunk.content, cardsPerChunk).catch(err => {
        console.warn('Error generating flashcards from chunk:', err.message);
        return [];
      })
    );

    const results = await Promise.all(chunkPromises);
    results.forEach(cards => allCards.push(...cards));

    // Deduplicate and return top results
    const uniqueCards = deduplicateFlashcards(allCards);
    return uniqueCards.slice(0, count);
  } catch (error) {
    console.error('Bulk flashcard generation error:', error);
    // Fallback to single chunk
    return generateFlashcardsFromText(text.substring(0, 3000), count);
  }
};

/**
 * Generate flashcards from a single text chunk
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */

const generateFlashcardsFromText = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
  Format each flashcard as:
  Q: [Clear, specific question]
  A: [Concise, accurate answer]
  D: [Difficulty level: easy, medium, or hard]
  
  Separate each flashcard with "---"
  
  Text:
  ${text.substring(0, 2000)}`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    // Parse the response
    const flashcards  =[];
    const cards = generatedText.split('---').filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split('\n');
      let question = '', answer = '', difficulty = 'medium';

      for (const line of lines) {
        const trimmed = line.trim().replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
        if (/^Q\s*:/i.test(trimmed)) {
          question = trimmed.replace(/^Q\s*:/i, '').trim();
        } else if (/^A\s*:/i.test(trimmed)) {
          answer = trimmed.replace(/^A\s*:/i, '').trim();
        } else if (/^D\s*:/i.test(trimmed)) {
          const diff = trimmed.replace(/^D\s*:/i, '').trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty});
      }
    }


     return flashcards.slice(0, count);
  } catch (error) {
   console.error('Gemini API error:', error);
   throw new Error('Failed to generate flashcards');
  }
};

/**
 *  Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions = Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */

export const generateQuiz = async (text, numQuestions = 5) => {
  // Split text into chunks for comprehensive coverage
  const chunks = chunkText(text, 800, 100);
  
  // If text is short, use old method
  if (chunks.length === 0 || text.length < 2000) {
    return generateQuizFromText(text, numQuestions);
  }

  const questionsPerChunk = Math.ceil(numQuestions / chunks.length);
  const allQuestions = [];

  try {
    // Generate quiz from each chunk in parallel
    const chunkPromises = chunks.map(chunk =>
      generateQuizFromText(chunk.content, questionsPerChunk).catch(err => {
        console.warn('Error generating quiz from chunk:', err.message);
        return [];
      })
    );

    const results = await Promise.all(chunkPromises);
    results.forEach(questions => allQuestions.push(...questions));

    // Deduplicate and return top results
    const uniqueQuestions = deduplicateFlashcards(allQuestions); // Use same dedup logic
    return uniqueQuestions.slice(0, numQuestions);
  } catch (error) {
    console.error('Bulk quiz generation error:', error);
    // Fallback to single chunk
    return generateQuizFromText(text.substring(0, 3000), numQuestions);
  }
};

/**
 * Generate quiz from a single text chunk
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */

const generateQuizFromText = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
  Format each question as:
  Q: [Question]
  O1: [Option 1]
  O2: [Option 2]
  O3: [Option 3]
  O4: [Option 4]
  C: [Correct option - exactly as written above]
  E: [Brief explanation]
  D: [Difficulty: easy, medium, or hard]
  
  Separate questions with "---"
  
  Text:
  ${text.substring(0, 2000)}`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    // Parse the response
    const questions = [];
    const questionBlocks = generatedText.split('---').filter(q => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');
      let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

      for (const line of lines) {
        const trimmed = line.trim().replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
        if (/^Q\s*:/i.test(trimmed)) {
          question = trimmed.replace(/^Q\s*:/i, '').trim();
        } else if (/^O\s*\d\s*:/i.test(trimmed)) {
          options.push(trimmed.replace(/^O\s*\d\s*:/i, '').trim());
        } else if (/^C\s*:/i.test(trimmed)) {
          correctAnswer = trimmed.replace(/^C\s*:/i, '').trim();
        } else if (/^E\s*:/i.test(trimmed)) {
          explanation = trimmed.replace(/^E\s*:/i, '').trim();
        }else if (/^D\s*:/i.test(trimmed)) {
          const diff = trimmed.replace(/^D\s*:/i, '').trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({ question, options, correctAnswer, explanation, difficulty});
      }
    }


     return questions.slice(0, numQuestions);
  } catch (error) {
   console.error('Gemini API error:', error);
   throw new Error('Failed to generate quiz');
  }
};

/**
 *  Generate document summary (improved version)
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */

export const generateSummary = async (text) => {
  // Split text into chunks
  const chunks = chunkText(text, 800, 100);
  
  // If very short, use single prompt
  if (chunks.length === 0 || text.length < 2000) {
    return generateSummaryFromText(text.substring(0, 3000));
  }

  try {
    // Generate summaries from key chunks (first, middle, last) for better coverage
    const keyChunks = [];
    keyChunks.push(chunks[0]); // First chunk
    
    if (chunks.length > 2) {
      keyChunks.push(chunks[Math.floor(chunks.length / 2)]); // Middle chunk
    }
    
    if (chunks.length > 1) {
      keyChunks.push(chunks[chunks.length - 1]); // Last chunk
    }

    const summaryPromises = keyChunks.map(chunk =>
      generateSummaryFromText(chunk.content).catch(err => {
        console.warn('Error generating summary from chunk:', err.message);
        return '';
      })
    );

    const summaries = await Promise.all(summaryPromises);
    const combinedContext = summaries.filter(s => s).join('\n\n');

    // Generate final comprehensive summary from partial summaries
    if (combinedContext.length > 0) {
      return generateSummaryFromText(combinedContext, true);
    }

    return generateSummaryFromText(text.substring(0, 3000));
  } catch (error) {
    console.error('Bulk summary generation error:', error);
    // Fallback to single chunk
    return generateSummaryFromText(text.substring(0, 3000));
  }
};

/**
 * Generate summary from text
 * @param {string} text - Document text
 * @param {boolean} isComposite - Whether summarizing partial summaries
 * @returns {Promise<string>}
 */

const generateSummaryFromText = async (text, isComposite = false) => {
  const instruction = isComposite 
    ? 'Combine and synthesize the following summaries into one comprehensive summary'
    : 'Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points';

  const prompt = `${instruction}. Keep the summary clear and structured.
  
  Text:
  ${text.substring(0, 3000)}`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

     return generatedText;
  } catch (error) {
   console.error('Gemini API error:', error);
   throw new Error('Failed to generate summary');
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */

export const chatWithContext = async (question, chunks) => {
  const context = chunks.map((c,i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

  const prompt = `Based on the following context from a document, Analyse the context and answer the user's question.
  If the answer is not in the context, say so.
  
  Context:
  ${context}
  
  Question: ${question}
  
  Answer:`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

   return generatedText;
  } catch (error) {
   console.error('Gemini API error:', error);
   throw new Error('Failed to process chat request');
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */

export const explainConcept = async (concept, context) => {
  
  const prompt = `Explain the concept of "${concept}" based on the following context. 
  Provide a clear, educational explanation that's easy to understand,
  Include examples if relevant.
  
  Context:
  ${context.substring(0, 10000)}`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

   return generatedText;
  } catch (error) {
   console.error('Gemini API error:', error);
   throw new Error('Failed to explain concept');
  }
};
