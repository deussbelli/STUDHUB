import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Profile.module.css";

function Profile() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    avatar: "",
    reputation: 0,
    activity: {
      createdTopics: 0,
      comments: 0,
      reviews: 0
    },
    status: "Новачок"
  });
  const token = localStorage.getItem("fake-jwt");

  axios.defaults.baseURL = "http://localhost:5000";

  const defaultAvatar = "/default_avatar.png"; // шлях до дефолтної аватарки

  // Функція для завантаження профілю
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get("/api/profile", {
        params: { token },
      });
      setUser(response.data);
      setProfileData(response.data);
    } catch (err) {
      console.error("Помилка при завантаженні профілю:", err);
      setError("Не вдалося завантажити профіль. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Оновлення профілю кожні 30 секунд
    const interval = setInterval(fetchUserProfile, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setError(null);
      setIsLoading(true);
  
      const response = await axios.put("/api/profile", profileData, {
        params: { token },
      });
  
      if (response.data.message === "Профіль оновлено") {
        // Викликати повторно fetch, щоб оновити user з бекенду:
        await fetchUserProfile(); // ⬅️ це ключовий момент
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Помилка при збереженні профілю:", err);
      setError("Не вдалося зберегти профіль.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("fake-jwt");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Завантаження профілю...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1 className={styles.profileTitle}>Профіль користувача</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Вийти з акаунту
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.profileContent}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer}>
            <img 
              src={isEditing ? (profileData.avatar || defaultAvatar) : (user?.avatar || defaultAvatar)} 
              alt="Avatar" 
              className={styles.avatarImage}
            />
            {isEditing && (
              <label className={styles.uploadLabel}>
                Змінити аватар
                <input 
                  type="file" 
                  className={styles.fileInput}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfileData({ 
                        ...profileData, 
                        avatar: URL.createObjectURL(e.target.files[0]) 
                      });
                    }
                  }}
                  accept="image/*"
                />
              </label>
            )}
          </div>
            <div className={styles.reputationBadge}>
              <span className={styles.reputationScore}>{user?.reputation || 100}</span>
              <span className={styles.reputationText}>репутація</span>
            </div>
            <div className={styles.statusBadge}>
              {user?.status || "Новачок"}
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoGroup}>
              <label className={styles.infoLabel}>Ім'я користувача</label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.infoInput}
                  value={profileData.nickname}
                  onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                />
              ) : (
                <p className={styles.infoText}>{user?.nickname || "Не вказано"}</p>
              )}
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.infoLabel}>Електронна пошта</label>
              {isEditing ? (
                <input
                  type="email"
                  className={styles.infoInput}
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              ) : (
                <p className={styles.infoText}>{user?.email}</p>
              )}
            </div>

            <div className={styles.activitySection}>
              <h3 className={styles.activityTitle}>Активність</h3>
              <div className={styles.activityStats}>
                <div className={styles.activityStat}>
                  <span className={styles.statNumber}>{user?.topics_count || 0}</span>
                  <span className={styles.statLabel}>Теми</span>
                </div>
                <div className={styles.activityStat}>
                  <span className={styles.statNumber}>{user?.comments_count || 0}</span>
                  <span className={styles.statLabel}>Коментарі</span>
                </div>
                <div className={styles.activityStat}>
                  <span className={styles.statNumber}>{user?.feedbacks_count || 0}</span>
                  <span className={styles.statLabel}>Відгуки</span>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              {isEditing ? (
                <button
                  onClick={handleSaveProfile}
                  className={styles.saveButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              ) : (
                <button
                  onClick={handleEditProfile}
                  className={styles.editButton}
                >
                  Редагувати профіль
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
