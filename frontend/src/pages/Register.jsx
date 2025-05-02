import React, { useState } from "react";
import styles from "../styles/Register.module.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("abiturient");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  // Додаткові поля
  const [faculty, setFaculty] = useState("");
  const [group, setGroup] = useState("");
  const [university, setUniversity] = useState("");
  const [rank, setRank] = useState("");

  // Список університетів (приклад)
  const universitiesList = [
    "Київський національний університет ім. Т. Шевченка",
    "Національний університет «Львівська політехніка»",
    "Харківський національний університет ім. В.Н. Каразіна",
    "Національний університет біоресурсів і природокористування України",
    "Київський політехнічний інститут ім. І. Сікорського"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Паролі не співпадають!");
      return;
    }
    if (!agree) {
      alert("Ви маєте погодитися з правилами!");
      return;
    }

    const userData = {
      role,
      name,
      email,
      nickname,
      password,
      faculty,
      group,
      university,
      rank
    };

    const result = await registerUser(userData);
    if (result.success) {
      alert("Реєстрація успішна! Вам на пошту відправлено код верифікації. Будь ласка, перевірте пошту.");
      navigate("/verify");
    } else {
      alert(`Помилка: ${result.message}`);
    }
  };

  const handleSSOLogin = () => {
    window.location.href = "http://localhost:5000/auth/azure";
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Реєстрація</h2>
          <p>Створіть новий обліковий запис</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Виберіть, хто ви?</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className={styles.select}
            >
              <option value="abiturient">Абітурієнт</option>
              <option value="student">Студент</option>
              <option value="teacher">Викладач</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name">Ім'я</label>
            <input
              id="name"
              type="text"
              placeholder="Ваше повне ім'я"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nickname">Нікнейм</label>
            <input
              id="nickname"
              type="text"
              placeholder="Оберіть нікнейм"
              value={nickname}
              required
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Електронна пошта</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {role === "student" && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="faculty">Факультет</label>
                <input
                  id="faculty"
                  type="text"
                  placeholder="Назва вашого факультету"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="group">Група</label>
                <input
                  id="group"
                  type="text"
                  placeholder="Номер або назва групи"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="university">Університет</label>
                <select
                  id="university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Оберіть університет</option>
                  {universitiesList.map((uni, index) => (
                    <option key={index} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {role === "teacher" && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="faculty">Факультет</label>
                <input
                  id="faculty"
                  type="text"
                  placeholder="Назва вашого факультету"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="rank">Звання/Посада</label>
                <input
                  id="rank"
                  type="text"
                  placeholder="Наприклад: Доцент, Професор"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="university">Університет</label>
                <select
                  id="university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Оберіть університет</option>
                  {universitiesList.map((uni, index) => (
                    <option key={index} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Не менше 8 символів"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirm">Підтвердіть пароль</label>
            <input
              id="confirm"
              type="password"
              placeholder="Введіть пароль ще раз"
              value={confirm}
              required
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <label htmlFor="agree">
              Я погоджуюсь з правилами форуму та політикою доброчесності
            </label>
          </div>

          <button type="submit" className={styles.primaryButton}>
            Зареєструватися
          </button>
        </form>

        <div className={styles.divider}>
          <span>або</span>
        </div>

        <button onClick={handleSSOLogin} className={styles.ssoButton}>
          <span className={styles.ssoIcon}>→</span> Увійти через корпоративний акаунт
        </button>

        <div className={styles.footer}>
          <p>
            Вже маєте акаунт? <a href="/login" className={styles.link}>Увійти</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;