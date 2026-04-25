import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import NotFoundPage from "./pages/Quizzes/NotFoundPage.jsx";
import FlashcardPage from "./pages/Flashcards/FlashcardPage.jsx";
import FlashcardListPage from "./pages/Flashcards/FlashcardListPage.jsx";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage.jsx";
import DocumentListPage from "./pages/Documents/DocumentListPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import QuizTakePage from "./pages/Quizzes/QuizTakePage.jsx";
import QuizResultPage from "./pages/Quizzes/QuizzesResultPage.jsx";
import ProtectedRoute from "./component/auth/ProtectedRoute.jsx";

const App = () => {
  const isAuthenticated = true;
  const loading = false;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading....</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/flashcards" element={<FlashcardListPage />} />
          <Route path="/document/:id/flashcards" element={<FlashcardPage />} />
          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResultPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
