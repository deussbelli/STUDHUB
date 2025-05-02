import React, { useState } from "react";
import { verifyEmail } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import styles from "../styles/VerifyEmail.module.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    const result = await verifyEmail(email, code);
    if (result.success) {
      setMessage("Електронну пошту підтверджено! Тепер ви можете увійти.");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMessage(`Помилка: ${result.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.verifyContainer}>
        <div className={styles.verifyHeader}>
          <h2 className={styles.verifyTitle}>Верифікація Email</h2>
          <p className={styles.verifySubtitle}>Введіть код підтвердження, який ми надіслали на вашу електронну пошту</p>
        </div>

        <form onSubmit={handleVerify} className={styles.verifyForm}>
          <div className={styles.formField}>
            <label htmlFor="email" className={styles.inputLabel}>Ваша пошта</label>
            <input
              id="email"
              type="email"
              placeholder="example@xx.edu.ua"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.textInput}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="code" className={styles.inputLabel}>Код підтвердження</label>
            <input
              id="code"
              type="text"
              placeholder="Введіть 7-значний код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.textInput}
              required
              maxLength="7"
            />
          </div>

          <button 
            type="submit" 
            className={styles.verifyButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}></span>
            ) : (
              "Підтвердити"
            )}
          </button>
        </form>

        {message && (
          <div className={`${styles.statusMessage} ${message.includes("Помилка") ? styles.errorMessage : styles.successMessage}`}>
            {message}
          </div>
        )}

        <div className={styles.verifyFooter}>
          <p className={styles.footerText}>Не отримали код? <button type="button" className={styles.resendButton}>Надіслати ще раз</button></p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;