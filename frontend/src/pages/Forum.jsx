import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Forum.module.css";

function Forum() {
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState(["Загальне", "Технічне", "Питання", "Ідеї"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    category: "Загальне"
  });

  axios.defaults.baseURL = "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let url = `/api/forum?search=${encodeURIComponent(searchQuery)}`;
        const response = await axios.get(url);
        setTopics(response.data);
        const serverCategories = [...new Set(response.data.map(t => t.category))];
        setCategories(prev => [...new Set([...prev, ...serverCategories])]);
      } catch (err) {
        console.error("Помилка при завантаженні тем:", err);
        setError("Не вдалося завантажити теми. Спробуйте пізніше.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    
    if (!newTopic.title.trim()) {
      setError("Будь ласка, введіть назву теми");
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem("fake-jwt") || "";
      const response = await axios.post("/api/forum", {
        token,
        title: newTopic.title,
        description: newTopic.description,
        category: newTopic.category
      });

      const createdTopic = response.data;
      setTopics(prev => [createdTopic, ...prev]);
      
      if (!categories.includes(createdTopic.category)) {
        setCategories(prev => [...prev, createdTopic.category]);
      }

      setShowCreateModal(false);
      setNewTopic({
        title: "",
        description: "",
        category: "Загальне"
      });

    } catch (err) {
      console.error("Помилка при створенні теми:", err);
      setError("Не вдалося створити тему. Можливо, ви не авторизовані?");
    }
  };

  const handleTopicClick = (id) => {
    navigate(`/forum/topic/${id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const filteredTopics = topics.filter(topic => {
    if (categoryFilter && topic.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Форум студентів</h1>
        <p className={styles.heroSubtitle}>Обговорення навчальних питань, підготовка до занять та обмін досвідом</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.controls}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Пошук тем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <span className={styles.searchIcon}>🔍</span>
            </button>
          </form>

          <button 
            onClick={() => setShowCreateModal(true)} 
            className={styles.createButton}
          >
            + Створити тему
          </button>
        </div>

        <div className={styles.categoryTabs}>
          <button 
            onClick={() => setCategoryFilter("")} 
            className={!categoryFilter ? styles.activeTab : ''}
          >
            Всі теми
          </button>
          {categories.map((cat, index) => (
            <button 
              key={index} 
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? styles.activeTab : ''}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Завантаження тем...</p>
          </div>
        ) : filteredTopics.length > 0 ? (
          <div className={styles.topicsGrid}>
            {filteredTopics.map(topic => (
              <div
                key={topic.id}
                className={styles.topicCard}
                onClick={() => handleTopicClick(topic.id)}
              >
                <span className={styles.categoryBadge}>{topic.category}</span>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                {topic.description && (
                  <p className={styles.topicDescription}>
                    {topic.description.length > 100
                      ? `${topic.description.substring(0, 100)}...`
                      : topic.description}
                  </p>
                )}
                <div className={styles.topicFooter}>
                  <div className={styles.author}>
                    <span className={styles.avatar}>
                      {topic.user?.nickname?.[0] || "?"}
                    </span>
                    <span>{topic.user?.nickname || "Анонім"}</span>
                  </div>
                  <div className={styles.stats}>
                    <span>💬 {topic.replies_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>Теми не знайдено. Спробуйте змінити параметри пошуку.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowCreateModal(false)}
            >
              &times;
            </button>
            
            <h2 className={styles.modalTitle}>Створити нову тему</h2>
            
            <form onSubmit={handleCreateTopic} className={styles.topicForm}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Назва теми*</label>
                <input
                  type="text"
                  id="title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  required
                  placeholder="Введіть назву теми"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description">Опис (необов'язково)</label>
                <textarea
                  id="description"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                  rows="4"
                  placeholder="Додатковий опис теми..."
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="category">Категорія*</label>
                <select
                  id="category"
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                  required
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelBtn}
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  Опублікувати тему
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;