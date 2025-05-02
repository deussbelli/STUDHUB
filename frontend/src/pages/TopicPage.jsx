import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "../styles/TopicPage.module.css";

function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`/api/forum/${id}`);
        setTopic(response.data);
      } catch (err) {
        console.error(err);
        setError("Не вдалося завантажити тему.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("fake-jwt") || "";
      const response = await axios.post(`/api/forum/${id}/comment`, {
        token,
        content: commentText
      });

      const newComment = response.data;
      setTopic((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), newComment],
      }));
      setCommentText("");
    } catch (err) {
      console.error(err);
      setError("Не вдалося додати коментар. Можливо, ви не авторизовані?");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Завантаження теми...</p>
      </div>
    );
  }
  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }
  if (!topic) {
    return <div className={styles.notFoundContainer}>Тема не знайдена</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.topicHeader}>
          <span className={styles.categoryBadge}>{topic.category}</span>
          <h1 className={styles.topicTitle}>{topic.title}</h1>
          <div className={styles.topicMeta}>
            <span className={styles.author}>
              Автор: {topic.user?.nickname || "Анонім"}
            </span>
            <span className={styles.date}>
              {new Date(topic.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {topic.description && (
          <div className={styles.topicDescription}>
            <p>{topic.description}</p>
          </div>
        )}

        <div className={styles.commentFormContainer}>
          <h3 className={styles.commentFormTitle}>Додати коментар</h3>
          <form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <textarea
              className={styles.commentInput}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Напишіть ваш коментар..."
              rows={4}
              required
            />
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinnerSmall}></span> Відправка...
                </>
              ) : (
                "Відправити коментар"
              )}
            </button>
          </form>
        </div>

        <div className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>
            Відповіді ({topic.replies?.length || 0})
          </h3>

          {topic.replies?.length > 0 ? (
            <div className={styles.commentsList}>
              {topic.replies.map((reply) => (
                <div key={reply.id} className={styles.commentCard}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentAuthor}>
                      <span className={styles.avatar}>
                        {reply.user?.nickname?.[0]?.toUpperCase() || "А"}
                      </span>
                      <span>{reply.user?.nickname || "Анонім"}</span>
                    </div>
                    <span className={styles.commentDate}>
                      {new Date(reply.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.commentContent}>
                    <p>{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noComments}>
              <p>Ще немає коментарів. Будьте першим!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopicPage;