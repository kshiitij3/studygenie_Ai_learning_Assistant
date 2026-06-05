# StudyGenie — AI Learning Assistant

StudyGenie is a full-stack, AI-powered learning platform designed to turn documents into active study tools. It combines document management, flashcard generation, quiz creation, AI chat, and progress tracking into one polished learning experience.

> Built for learners, students, and modern education products.
## Key Features

- **User authentication** with login and registration.
- **Document upload and parsing** for PDF and text content.
- **AI-powered flashcards** generated automatically from document content.
- **AI-generated quizzes** with multiple-choice questions and explanations.
- **Study flow** from document to flashcards to quiz results.
- **Progress tracking** and interactive review experience.
- **Document chat** to ask questions from parsed document context.

## Why this project stands out

- Uses **Google Gemini** to generate structured flashcards, quizzes, summaries, and answers.
- Supports **real document workflows** with file upload, parsing, and intelligent study resources.
- Combines **frontend design** and a **scalable backend** for production-like architecture.
- Demonstrates strong experience in **React, Vite, Express, MongoDB, authentication, and AI integration**.

## Tech Stack

- Frontend: **React**, **Vite**, **Tailwind CSS**, **React Router**, **Axios**
- Backend: **Node.js**, **Express**, **Mongoose**, **JWT authentication**, **multer**
- AI: **Google Gemini API** via `@google/genai`
- Data Storage: **MongoDB**
- Utilities: **pdf-parse**, **dotenv**, **react-hot-toast**

## Project Structure

- `frontend/StudyGenie/` — React application and UI components
- `backend/` — Express API, MongoDB models, AI services, and routes
- `backend/controllers/` — business logic for documents, flashcards, quizzes, auth, progress
- `backend/models/` — MongoDB schemas for users, documents, flashcards, quizzes, chat history
- `frontend/StudyGenie/src/` — pages, components, services, and utilities for the app

## How it works

1. **Authenticate**: Users create an account and log in.
2. **Upload documents**: Users upload documents that are parsed and stored.
3. **Generate flashcards**: AI reads document text and creates study cards.
4. **Take quizzes**: Users can generate and take quizzes on document content.
5. **Review progress**: Results, scores, and review history are displayed.
6. **Ask questions**: Use AI chat to query document context directly.

## Setup & Installation

### Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following values:
   ```bash
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   GEMINI_API_KEY=<your_gemini_api_key>
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend application:
   ```bash
   cd frontend/StudyGenie
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```

## Usage

- Visit `/login` or `/register` to create an account.
- Upload or select a document from the dashboard.
- Generate flashcards or quizzes with AI assistance.
- Navigate to the flashcards page to study and review content.
- Use the quiz flow to test knowledge and view results.



- Showcases end-to-end product thinking from **user onboarding** to **AI-generated education content**.
- Integrates advanced AI features in a structured, maintainable backend.
- Uses real-world data flow: **file upload → text extraction → AI generation → user interaction**.
- Demonstrates ability to build a complete SaaS-style learning app with **scalable architecture**.
- Includes strong UI/UX patterns and responsive design with React.

## Future Improvements

- Add **real-time collaboration** or shared learning groups.
- Improve AI prompting for even richer flashcards and quizzes.
- Add **analytics dashboards** for study performance.
- Build a **mobile-first experience** with offline review support.

## Contact

If you'd like to see this project in action or discuss the architecture, I'm happy to walk through the code and design decisions.
