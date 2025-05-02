import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/SubmitRequest.module.css";

function SubmitRequest() {
  const navigate = useNavigate();
  const [requestType, setRequestType] = useState("запит");
  const [recipient, setRecipient] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState("");
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("fake-jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    axios
      .get("http://localhost:5000/api/requests/me", { params: { token } })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMyRequests(res.data);
          setError("");
        }
      })
      .catch((err) => {
        console.error("Помилка при завантаженні звернень:", err);
        setError("Не вдалося завантажити ваші звернення");
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("fake-jwt");
    if (!token) {
      setError("Будь ласка, увійдіть у систему");
      navigate("/login");
      return;
    }

    if (!recipient.trim() || !topic.trim() || !description.trim()) {
      setError("Заповніть усі обов'язкові поля!");
      return;
    }

    setIsLoading(true);
    setError("");

    const payload = {
      token,
      request_type: requestType,
      recipient,
      topic,
      description,
      attachments,
    };

    axios
      .post("http://localhost:5000/api/requests", payload)
      .then((res) => {
        if (res.data.success) {
          setRequestType("запит");
          setRecipient("");
          setTopic("");
          setDescription("");
          setAttachments("");
          return axios.get("http://localhost:5000/api/requests/me", {
            params: { token },
          });
        } else {
          setError(res.data.error || "Сталася помилка");
        }
      })
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setMyRequests(res.data);
        }
      })
      .catch((err) => {
        console.error("Помилка:", err);
        setError("Не вдалося надіслати звернення");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Сторінка звернень</h1>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.requestForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Тип звернення</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className={styles.formSelect}
            >
              <option value="запит">Запит</option>
              <option value="скарга">Скарга</option>
              <option value="пропозиція">Пропозиція</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Одержувач*</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={styles.formInput}
              placeholder="До кого звернення?"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Тема*</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={styles.formInput}
              placeholder="Коротка тема звернення"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Опис*</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.formTextarea}
              placeholder="Детальний опис вашого звернення"
              required
              rows={5}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Вкладення</label>
            <input
              type="text"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              className={styles.formInput}
              placeholder="Посилання на файли (через кому)"
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Відправка...' : 'Надіслати звернення'}
          </button>
        </form>

        <div className={styles.myRequestsSection}>
          <h2 className={styles.sectionTitle}>Мої звернення</h2>
          
          {isLoading ? (
            <div className={styles.loading}>Завантаження...</div>
          ) : myRequests.length === 0 ? (
            <p className={styles.noRequests}>Поки що немає звернень</p>
          ) : (
            <div className={styles.requestsList}>
              {myRequests.map((req) => (
                <div key={req.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <span className={`${styles.requestType} ${
                      req.request_type === 'скарга' ? styles.typeComplaint : 
                      req.request_type === 'пропозиція' ? styles.typeProposal : 
                      styles.typeQuery
                    }`}>
                      {req.request_type}
                    </span>
                    <span className={styles.requestDate}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={styles.requestTopic}>{req.topic}</h3>
                  <p className={styles.requestRecipient}>
                    <strong>Одержувач:</strong> {req.recipient}
                  </p>
                  <p className={styles.requestDescription}>
                    {req.description.length > 150 
                      ? `${req.description.substring(0, 150)}...` 
                      : req.description}
                  </p>
                  {req.attachments && (
                    <div className={styles.requestAttachments}>
                      <strong>Вкладення:</strong> {req.attachments}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmitRequest;