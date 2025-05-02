import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>StudHub</h3>
            <p className={styles.footerText}>
              Платформа для студентів, де можна знайти навчальні матеріали, обговорювати теми та ділитися знаннями.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Навігація</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/" className={styles.footerLink}>Головна</Link></li>
              <li><Link to="/search" className={styles.footerLink}>Пошук</Link></li>
              <li><Link to="/forum" className={styles.footerLink}>Форум</Link></li>
              <li><Link to="/news" className={styles.footerLink}>Новини</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Інформація</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/rules" className={styles.footerLink}>Правила</Link></li>
              <li><Link to="/privacy" className={styles.footerLink}>Конфіденційність</Link></li>
              <li><Link to="/feedback" className={styles.footerLink}>Зворотній зв'язок</Link></li>
              <li><Link to="/faq" className={styles.footerLink}>FAQ</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Контакти</h4>
            <ul className={styles.footerContacts}>
              <li className={styles.contactItem}>Email: info@studhub.com</li>
              <li className={styles.contactItem}>Телефон: +380 00 000 0000</li>
              <li className={styles.contactItem}>Адреса: м. Львів, вул. Університетська, 1</li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} StudHub. Усі права захищені.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Telegram">
              <i className="fab fa-telegram-plane"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;