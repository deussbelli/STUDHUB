// pages/News.js
import React, { useState, useEffect } from "react";
import styles from "../styles/News.module.css";
import { isAdmin } from "../utils/auth";

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for adding/editing news
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Check if user is admin
  const admin = isAdmin();

  // Fetch news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/news");
      const data = await response.json();
      
      if (data.success) {
        setNews(data.news);
      } else {
        setError(data.message || "Помилка при завантаженні новин");
      }
    } catch (err) {
      setError("Не вдалося з'єднатися з сервером");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new news item
  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "is_admin": "1" // Admin header
        },
        body: JSON.stringify({ title, content })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNews([data.news_item, ...news]);
        resetForm();
        alert("Оголошення успішно додано!");
      } else {
        alert(data.message || "Помилка при додаванні оголошення");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    }
  };

  // Update news item
  const handleUpdateNews = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/news/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "is_admin": "1" // Admin header
        },
        body: JSON.stringify({ title, content })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNews(news.map(item => item.id === editingId ? data.news_item : item));
        resetForm();
        alert("Оголошення успішно оновлено!");
      } else {
        alert(data.message || "Помилка при оновленні оголошення");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    }
  };

  // Delete news item
  const handleDeleteNews = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити це оголошення?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/news/${id}`, {
        method: "DELETE",
        headers: { "is_admin": "1" } // Admin header
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNews(news.filter(item => item.id !== id));
        alert("Оголошення успішно видалено!");
      } else {
        alert(data.message || "Помилка при видаленні оголошення");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    }
  };

  // Parse news from MON website
  const handleParseMonNews = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/news/parse-osvita", {
        method: "POST",
        headers: { "is_admin": "1" } // Admin header
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchNews(); // Reload news after parsing
        alert(data.message);
      } else {
        alert(data.message || "Помилка при парсингу новин");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Edit news item
  const handleEditClick = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setShowForm(false);
  };

  if (loading) return <div className={styles.loader}>Завантаження новин...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.newsContainer}>
      <h1>Новини та оголошення</h1>
      
      {admin && (
        <div className={styles.adminPanel}>
          <button 
            className={styles.addButton} 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Скасувати" : "Додати оголошення"}
          </button>
          
          <button 
            className={styles.parseButton} 
            onClick={handleParseMonNews}
            disabled={loading}
          >
            Спарсити новини з Освіта.UA
          </button>
        </div>
      )}

      {admin && showForm && (
        <div className={styles.formContainer}>
          <h2>{isEditing ? "Редагувати оголошення" : "Додати нове оголошення"}</h2>
          <form onSubmit={isEditing ? handleUpdateNews : handleAddNews}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Заголовок:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="content">Зміст:</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
              />
            </div>
            
            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton}>
                {isEditing ? "Оновити" : "Опублікувати"}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={resetForm}
                >
                  Скасувати
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className={styles.newsList}>
        {news.length === 0 ? (
          <p>Немає новин для відображення</p>
        ) : (
          news.map((item) => (
            <div key={item.id} className={styles.newsItem}>
              <h2>{item.title}</h2>
              <p className={styles.newsContent}>{item.content}</p>
              
              <div className={styles.newsMetaInfo}>
                <span className={styles.newsSource}>Джерело: {item.source}</span>
                <span className={styles.newsDate}>
                  {new Date(item.created_at).toLocaleDateString('uk-UA')}
                </span>
                
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.newsLink}
                  >
                    Повна новина
                  </a>
                )}
              </div>
              
              {admin && item.source === "Адміністрація" && (
                <div className={styles.newsActions}>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEditClick(item)}
                  >
                    Редагувати
                  </button>
                  
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteNews(item.id)}
                  >
                    Видалити
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default News;