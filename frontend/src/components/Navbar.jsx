import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";
import styles from "../styles/Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    const checkAuth = () => setLoggedIn(isAuthenticated());
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [window.location.href]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setMenuActive(false);
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          StudHub
        </Link>
        
        <div 
          className={`${styles.navLinks} ${menuActive ? styles.active : ""}`}
          onClick={() => setMenuActive(false)}
        >
          <Link to="/search" className={styles.navLink}>
            Пошук
          </Link>
          <Link to="/forum" className={styles.navLink}>
            Форум
          </Link>
          <Link to="/feedback" className={styles.navLink}>
            Відгуки
          </Link>
          <Link to="/news" className={styles.navLink}>
            Новини
          </Link>
          <Link to="/rules" className={styles.navLink}>
            Правила та доброчесність
          </Link>
          
          {loggedIn && (
            <Link to="/submit-request" className={styles.navLink}>
              Звернення
            </Link>
          )}
        </div>

        <div 
          className={`${styles.authSection} ${menuActive ? styles.active : ""}`}
          onClick={() => setMenuActive(false)}
        >
          {!loggedIn ? (
            <>
              <Link to="/login" className={styles.authLink}>
                Увійти
              </Link>
              <Link to="/register" className={`${styles.authLink} ${styles.registerLink}`}>
                Реєстрація
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className={styles.authLink}>
                Профіль
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Вийти
              </button>
            </>
          )}
        </div>

        <div 
          className={`${styles.menuToggle} ${menuActive ? styles.active : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;