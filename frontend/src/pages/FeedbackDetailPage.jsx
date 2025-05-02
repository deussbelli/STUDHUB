import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/FeedbackDetailPage.module.css";

function FeedbackDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("fake-jwt");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/feedback/${id}`);
        if (response.data.error) {
          setError(response.data.error);
          navigate("/feedback");
        } else {
          setFeedback(response.data);
        }
      } catch (err) {
        setError("Не вдалося завантажити відгук");
        console.error("Помилка:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [id, navigate]);

  const handleAddComment = async () => {
    if (!token) {
      setError("Авторизуйтесь, щоб додавати коментарі!");
      return;
    }
    if (!newComment.trim()) {
      setError("Порожній коментар");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(`http://localhost:5000/api/feedback/${id}/comment`, {
        token,
        comment_text: newComment,
      });

      if (response.data.success) {
        setNewComment("");
        const updatedFeedback = await axios.get(`http://localhost:5000/api/feedback/${id}`);
        setFeedback(updatedFeedback.data);
      } else {
        setError(response.data.error || "Сталася помилка");
      }
    } catch (err) {
      setError("Не вдалося додати коментар");
      console.error("Помилка:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!token) {
      setError("Авторизуйтесь для взаємодії!");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(`http://localhost:5000/api/feedback/${id}/${action}`, { token });

      if (response.data.success) {
        const updatedFeedback = await axios.get(`http://localhost:5000/api/feedback/${id}`);
        setFeedback(updatedFeedback.data);
      } else {
        setError(response.data.error || "Сталася помилка");
      }
    } catch (err) {
      setError("Не вдалося виконати дію");
      console.error("Помилка:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Завантаження відгуку...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/feedback')}
        >
          Повернутись до списку відгуків
        </button>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className={styles.notFoundContainer}>
        <p>Відгук не знайдено</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/feedback')}
        >
          Повернутись до списку відгуків
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Детальний перегляд відгуку</h2>
          <div className={styles.feedbackMeta}>
            <span className={styles.feedbackType}>{feedback.subject_type}</span>
            <span className={styles.feedbackSubject}>{feedback.subject_name}</span>
          </div>
        </div>

        <div className={styles.feedbackContent}>
          <div className={styles.ratingContainer}>
            <div className={styles.ratingStars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < feedback.rating ? styles.starFilled : styles.starEmpty}>★</span>
              ))}
            </div>
            <span className={styles.ratingText}>{feedback.rating}/5</span>
          </div>

          <p className={styles.feedbackText}>{feedback.feedback_text}</p>

          {feedback.link && (
            <div className={styles.linkContainer}>
              <a 
                href={feedback.link} 
                target="_blank" 
                rel="noreferrer" 
                className={styles.externalLink}
              >
                {feedback.link}
              </a>
            </div>
          )}

          {feedback.files && feedback.files.length > 0 && (
            <div className={styles.filesContainer}>
              <h3 className={styles.filesTitle}>Прикріплені файли:</h3>
              <ul className={styles.filesList}>
                {feedback.files.split(",").map((path, i) => (
                  <li key={i}>
                    <a 
                      href={`file:///${path}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={styles.fileLink}
                    >
                      {path.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.actionsContainer}>
          <div className={styles.reactionButtons}>
            <button
              onClick={() => handleAction("like")}
              className={styles.likeButton}
            >
              👍 {feedback.likes}
            </button>
            <button
              onClick={() => handleAction("dislike")}
              className={styles.dislikeButton}
            >
              👎 {feedback.dislikes}
            </button>
            <button
              onClick={() => handleAction("report")}
              className={styles.reportButton}
            >
              ⚠️ Поскаржитись ({feedback.reports})
            </button>
          </div>
        </div>

        <div className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>Коментарі ({feedback.comments?.length || 0})</h3>
          
          {feedback.comments?.length > 0 ? (
            <ul className={styles.commentsList}>
              {feedback.comments.map((comment) => (
                <li key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.nickname}</span>
                    <span className={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className={styles.commentText}>{comment.comment_text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noComments}>Немає коментарів. Будьте першим!</p>
          )}

          <div className={styles.addCommentContainer}>
            <h4 className={styles.addCommentTitle}>Додати коментар</h4>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.commentInput}
              placeholder="Введіть ваш коментар..."
              rows={4}
            />
            <button
              onClick={handleAddComment}
              className={styles.submitCommentButton}
              disabled={!newComment.trim() || isLoading}
            >
              {isLoading ? 'Відправка...' : 'Надіслати коментар'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDetailPage;