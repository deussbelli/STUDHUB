import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/FeedbackPage.module.css";

function FeedbackPage() {
  const navigate = useNavigate();
  const [subjectType, setSubjectType] = useState("lecturer");
  const [subjectName, setSubjectName] = useState("");
  const [rating, setRating] = useState(0);
  const [link, setLink] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [allFeedback, setAllFeedback] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("fake-jwt");

  useEffect(() => {
    fetchAllFeedback();
    if (token) {
      fetchMyFeedback();
    }
  }, [token]);

  const fetchAllFeedback = () => {
    setIsLoading(true);
    let url = "http://localhost:5000/api/feedback?";
    if (filterType) url += `subject_type=${filterType}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    
    axios.get(url)
      .then((res) => {
        setAllFeedback(res.data || []);
        setError("");
      })
      .catch((err) => {
        console.error("Помилка при завантаженні відгуків:", err);
        setError("Не вдалося завантажити відгуки");
      })
      .finally(() => setIsLoading(false));
  };

  const fetchMyFeedback = () => {
    if (!token) return;
    setIsLoading(true);
    axios.get("http://localhost:5000/api/feedback/me", { params: { token } })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMyFeedbacks(res.data);
        } else if (res.data.error) {
          setError(res.data.error);
        }
      })
      .catch((err) => {
        console.error("Помилка при завантаженні моїх відгуків:", err);
        setError("Не вдалося завантажити ваші відгуки");
      })
      .finally(() => setIsLoading(false));
  };

  const handleSearchFilter = (e) => {
    e.preventDefault();
    fetchAllFeedback();
  };

  const handleCreateFeedback = (e) => {
    e.preventDefault();
    if (!token) {
      setError("Спершу авторизуйтеся!");
      return;
    }
    if (!feedbackText.trim()) {
      setError("Заповніть текст відгуку!");
      return;
    }

    setIsLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("token", token);
    formData.append("subject_type", subjectType);
    formData.append("subject_name", subjectName);
    formData.append("rating", rating.toString());
    formData.append("link", link);
    formData.append("feedback_text", feedbackText);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    axios.post("http://localhost:5000/api/feedback", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      if (res.data.success) {
        setSubjectType("lecturer");
        setSubjectName("");
        setRating(0);
        setLink("");
        setFeedbackText("");
        setFiles([]);
        fetchAllFeedback();
        fetchMyFeedback();
      } else {
        setError(res.data.error || "Сталася помилка");
      }
    })
    .catch((err) => {
      console.error("Помилка при створенні відгуку:", err);
      setError("Не вдалося створити відгук");
    })
    .finally(() => setIsLoading(false));
  };

  const goToFeedbackDetail = (id) => {
    navigate(`/feedback/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Сторінка відгуків</h1>

        {/* Пошук і фільтрація */}
        <form onSubmit={handleSearchFilter} className={styles.searchForm}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Пошук відгуків..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Всі типи</option>
              <option value="lecturer">Викладач</option>
              <option value="faculty">Факультет</option>
              <option value="university">Університет</option>
              <option value="course">Курс</option>
            </select>
            <button type="submit" className={styles.searchButton}>
              Пошук
            </button>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        {/* Всі відгуки */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Усі відгуки</h2>
          {isLoading ? (
            <div className={styles.loading}>Завантаження...</div>
          ) : allFeedback.length === 0 ? (
            <p className={styles.noResults}>Відгуків не знайдено</p>
          ) : (
            <div className={styles.feedbackGrid}>
              {allFeedback.map((fb) => (
                <div key={fb.id} className={styles.feedbackCard} onClick={() => goToFeedbackDetail(fb.id)}>
                  <div className={styles.feedbackHeader}>
                    <span className={styles.feedbackType}>{fb.subject_type}</span>
                    <span className={styles.feedbackRating}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < fb.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </span>
                  </div>
                  <h3 className={styles.feedbackSubject}>{fb.subject_name}</h3>
                  <p className={styles.feedbackText}>
                    {fb.feedback_text.length > 100
                      ? `${fb.feedback_text.substring(0, 100)}...`
                      : fb.feedback_text}
                  </p>
                  <button className={styles.detailsButton}>Детальніше</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Форма створення відгуку */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Створити відгук</h2>
          {!token ? (
            <div className={styles.authPrompt}>
              <p>Авторизуйтесь, щоб залишити відгук</p>
              <button 
                className={styles.authButton}
                onClick={() => navigate('/login')}
              >
                Увійти
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateFeedback} className={styles.feedbackForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Тип відгуку</label>
                <select
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="lecturer">Викладач</option>
                  <option value="faculty">Факультет</option>
                  <option value="university">Університет</option>
                  <option value="course">Курс</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Назва</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Ім'я викладача або назва"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Рейтинг (0-5)</label>
                <div className={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`${styles.ratingStar} ${star <= rating ? styles.selected : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Посилання (необов'язково)</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={styles.formInput}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Текст відгуку*</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className={styles.formTextarea}
                  required
                  rows="5"
                  placeholder="Ваш відгук..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Файли (необов'язково)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className={styles.fileInput}
                />
                {files.length > 0 && (
                  <div className={styles.filesPreview}>
                    {Array.from(files).map((file, i) => (
                      <span key={i} className={styles.fileName}>{file.name}</span>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Відправка...' : 'Надіслати відгук'}
              </button>
            </form>
          )}
        </section>

        {/* Мої відгуки */}
        {token && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Мої відгуки</h2>
            {isLoading ? (
              <div className={styles.loading}>Завантаження...</div>
            ) : myFeedbacks.length === 0 ? (
              <p className={styles.noResults}>У вас поки немає відгуків</p>
            ) : (
              <div className={styles.myFeedbackList}>
                {myFeedbacks.map((fb) => (
                  <div key={fb.id} className={styles.myFeedbackItem}>
                    <div className={styles.myFeedbackHeader}>
                      <span className={styles.myFeedbackType}>{fb.subject_type}</span>
                      <span className={styles.myFeedbackRating}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < fb.rating ? styles.starFilled : styles.starEmpty}>★</span>
                        ))}
                      </span>
                    </div>
                    <h3 className={styles.myFeedbackSubject}>{fb.subject_name}</h3>
                    <p className={styles.myFeedbackText}>{fb.feedback_text}</p>
                    <button 
                      className={styles.detailsButton}
                      onClick={() => goToFeedbackDetail(fb.id)}
                    >
                      Переглянути
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default FeedbackPage;