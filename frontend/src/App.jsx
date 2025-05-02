import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import SubmitRequest from "./pages/SubmitRequest"; 
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackDetailPage from "./pages/FeedbackDetailPage";
import Forum from "./pages/Forum";
import TopicPage from "./pages/TopicPage";
import SearchPage from "./pages/SearchPage";
import News from "./pages/News";
import Rules from "./pages/Rules";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Якщо в URL є ?token=..., зберігаємо у localStorage
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("fake-jwt", token);
      // видаляємо токен з адреси
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Нова сторінка для верифікації email */}
        <Route path="/verify" element={<VerifyEmail />} />

        {/* Інші ваші сторінки */}
        <Route path="/create-topic" element={<div>Створення теми</div>} />

        {/* Залишення відгуку – для прикладу зробимо окрему сторінку */}
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/:id" element={<FeedbackDetailPage />} />

        {/* Подати звернення */}
        <Route path="/submit-request" element={<SubmitRequest />} />

        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/topic/:id" element={<TopicPage />} />
        
        <Route path="/search" element={<SearchPage />} />

        <Route path="/news" element={<News />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<div>Сторінку не знайдено</div>} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
