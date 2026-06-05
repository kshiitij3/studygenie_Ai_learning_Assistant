# StudyGenie AI Learning Assistant

StudyGenie is a full-stack learning application that transforms documents into interactive study resources using AI. It allows users to upload documents, generate flashcards, take quizzes, and ask questions about documents — all from a polished React frontend and a scalable Node.js backend.

## Project Overview

StudyGenie is designed to help learners study smarter by automating content transformation and supporting active recall.

- Upload documents to the platform
- Extract and parse document text
- Generate AI-driven flashcards and quizzes
- Review progress and quiz results
- Ask questions with document-aware AI chat

## Key Features

- **User Authentication**: Secure login and registration with JWT-based auth.
- **Document Management**: Upload, view, and browse documents.
- **Flashcard Generation**: Create flashcards automatically from document text.
- **Quiz Creation**: Generate multiple-choice quizzes with answers and explanations.
- **AI Chat**: Ask questions using document context powered by Google Gemini.
- **Progress Tracking**: Track flashcard review status and quiz outcomes.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, multer
- AI Integration: Google Gemini API via `@google/genai`
- Document Parsing: `pdf-parse`
- Environment: dotenv for configuration

## Repository Structure

- `backend/`
  - `server.js` — Express server entrypoint
  - `controllers/` — API business logic for auth, documents, flashcards, quizzes, progress
  - `models/` — Mongoose schemas for users, documents, flashcards, quizzes, chat history
  - `routes/` — API route definitions
  - `utils/` — AI service integration, file upload, PDF parsing, text chunking

- `frontend/StudyGenie/`
  - `src/` — React application source code
  - `src/pages/` — Application views for auth, dashboard, documents, flashcards, quizzes, profile
  - `src/component/` — Reusable UI components and widgets
  - `src/services/` — API service wrappers for backend endpoints
  - `src/utils/` — shared utilities and path constants

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB instance available
- Google Gemini API key (for AI features)

### Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```bash
   MONGODB_URI=<your_mongo_connection_string>
   JWT_SECRET=<your_jwt_secret>
   GEMINI_API_KEY=<your_gemini_api_key>
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open another terminal and navigate to the frontend folder:
   ```bash
   cd frontend/StudyGenie
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Running the Application

- The backend runs on the configured port in `backend/server.js`.
- The frontend runs with Vite and connects to the backend via API requests.
- Open the app in your browser via the Vite development URL.

## API Highlights

- `POST /api/auth/login` — login user
- `POST /api/auth/register` — register user
- `GET /api/documents` — list user documents
- `POST /api/ai/generate-flashcards` — generate flashcards from document text
- `GET /api/flashcards` — retrieve all flashcard sets
- `GET /api/flashcards/:documentId` — retrieve flashcards for a specific document
- `GET /api/quizzes/:documentId` — retrieve quizzes for a document

## Frontend Routes

- `/login` — login page
- `/register` — registration page
- `/dashboard` — user dashboard
- `/documents` — document list
- `/documents/:id` — document detail page
- `/flashcards` — flashcard sets overview
- `/document/:id/flashcards` — flashcards for a document
- `/quizzes/:quizId` — take quiz
- `/quizzes/:quizId/results` — quiz results
- `/profile` — user profile



This project demonstrates:

- Full-stack application development
- AI integration with real document workflows
- Authentication and secure user flows
- Clean frontend structure and responsive UI
- Backend API design and MongoDB data modeling
- End-to-end data flow from upload to study resources

## Future Enhancements

- Add real-time chat and collaboration features
- Improve AI flashcard quality with richer prompts
- Add user analytics and learning progress dashboards
- Support mobile-responsive study workflows
