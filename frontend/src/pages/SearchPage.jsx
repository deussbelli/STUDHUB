import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/SearchPage.module.css";

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("");
  const [sort, setSort] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {
        q: searchQuery,
        contentType,
        category,
        period,
        sort,
      };

      const response = await axios.get("http://localhost:5000/api/search", { params });
      setResults(response.data);
    } catch (error) {
      console.error("Помилка пошуку:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Пошук</h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Тип контенту</label>
              <select 
                className={styles.formSelect}
                value={contentType} 
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="">Всі</option>
                <option value="articles">Статті</option>
                <option value="reviews">Відгуки</option>
                <option value="news">Новини</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Категорія</label>
              <select 
                className={styles.formSelect}
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Всі</option>
                <option value="education">Освіта</option>
                <option value="events">Події</option>
                <option value="science">Наука</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Період</label>
              <select 
                className={styles.formSelect}
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="">Весь час</option>
                <option value="last7days">Останні 7 днів</option>
                <option value="last30days">Останні 30 днів</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Сортування</label>
              <select 
                className={styles.formSelect}
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Без сортування</option>
                <option value="date_desc">За датою (новіші)</option>
                <option value="date_asc">За датою (старіші)</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Пошуковий запит</label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="Введіть ключові слова..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.searchButton}>
            Знайти
          </button>
        </form>

        <h2 className={styles.resultsTitle}>Результати пошуку:</h2>
        {results.length === 0 ? (
          <p className={styles.noResults}>Нічого не знайдено</p>
        ) : (
          <ul className={styles.resultsList}>
            {results.map((item, index) => (
              <li key={index} className={styles.resultItem}>
                <span className={styles.resultType}>{item.type || "Невідомий тип"}</span>
                <h3 className={styles.resultTitle}>
                  {item.title || item.feedback_text || item.description || "[Без назви]"}
                </h3>
                <p className={styles.resultDate}>
                  <strong>Дата створення:</strong> {item.created_at}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SearchPage;