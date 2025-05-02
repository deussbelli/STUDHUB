import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [popularDiscussions, setPopularDiscussions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Отримуємо теми форуму
    fetch("http://localhost:5000/api/forum")
      .then((res) => res.json())
      .then((data) => {
        // Обрізаємо до 3 найновіших
        const top3 = data.slice(0, 3).map(topic => ({
          id: topic.id,
          title: topic.title,
          replies: topic.replies || 0, // або можеш запитувати окремо
          views: 0 // заміни на справжнє, якщо є
        }));
        setPopularDiscussions(top3);
      })
      .catch((err) => console.error("Forum fetch error:", err));

    // Отримуємо новини
    fetch("http://localhost:5000/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.news) {
          const top3 = data.news.slice(0, 3).map(item => ({
            id: item.id,
            text: item.title,
            date: item.created_at
          }));
          setAnnouncements(top3);
        }
      })
      .catch((err) => console.error("News fetch error:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Ласкаво просимо на StudHub!</h1>
        <p className={styles.heroSubtitle}>
          Тут ви можете обговорювати навчальні теми, ділитися досвідом і отримувати відповіді.
        </p>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            placeholder="Пошук обговорень, матеріалів, оголошень..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <span className={styles.searchIcon}>🔍</span> Пошук
          </button>
        </form>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Популярні обговорення</h2>
            <div className={styles.discussionsList}>
              {popularDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className={styles.discussionCard}
                  onClick={() => navigate(`/forum/topic/${discussion.id}`)}
                >
                  <h3 className={styles.discussionTitle}>{discussion.title}</h3>
                  <div className={styles.discussionMeta}>
                    <span>Відповіді: {discussion.replies}</span>
                    <span>Перегляди: {discussion.views}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.seeAllButton} onClick={() => navigate("/forum")}>
              Дивитися всі обговорення →
            </button>
          </section>
        </div>

        <div className={styles.sidebar}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Оголошення</h2>
            <div className={styles.announcementsList}>
              {announcements.map((announcement) => (
                <div key={announcement.id} className={styles.announcementCard}>
                  <p className={styles.announcementText}>{announcement.text}</p>
                  <span className={styles.announcementDate}>{announcement.date}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;
