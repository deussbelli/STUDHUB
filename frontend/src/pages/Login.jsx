import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isAuthenticated = !!localStorage.getItem("fake-jwt");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("fake-jwt", data.token);
        localStorage.setItem("is_admin", data.is_admin === 1 ? "1" : "0");
        alert("Ви успішно увійшли!");
        navigate("/");
      } else {
        if (response.status === 403 && data.error) {
          alert(data.error);
          navigate("/verify");
        } else {
          alert(data.error || "Помилка при логіні");
        }
      }
    } catch (error) {
      console.error("Помилка логіну:", error);
      alert("Сталася помилка при з'єднанні з сервером.");
    }
  };

  const handleSSOLogin = () => {
    window.location.href = "http://localhost:5000/auth/azure";
  };

  if (isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.alreadyAuth}`}>
          <p>Ви вже авторизовані!</p>
          <button onClick={() => navigate("/")}>На головну</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Вхід в систему</h2>
          <p>Будь ласка, введіть ваші дані</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Електронна пошта</label>
            <input
              id="email"
              type="email"
              placeholder="Ваша електронна пошта"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Ваш пароль"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.primaryButton}>
            Увійти
          </button>
        </form>

        <div className={styles.divider}>
          <span>або</span>
        </div>

        <button onClick={handleSSOLogin} className={styles.ssoButton}>
          <span className={styles.ssoIcon}>→</span> Увійти через корпоративний акаунт
        </button>

        <div className={styles.footer}>
          <a href="/reset-password" className={styles.link}>
            Забули пароль?
          </a>
          <span className={styles.separator}>•</span>
          <a href="/register" className={styles.link}>
            Немає акаунту? Зареєструватись
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;