// pages/Rules.js
import React, { useState, useEffect } from "react";
import styles from "../styles/Rules.module.css";
import { isAdmin } from "../utils/auth";

function Rules() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for adding/editing rules
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState("Загальні правила");
  const [showForm, setShowForm] = useState(false);
  const [availableSections, setAvailableSections] = useState(["Загальні правила", "Академічна доброчесність"]);
  
  // Check if user is admin
  const admin = isAdmin();

  // Fetch rules
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/rules");
      const data = await response.json();
      
      if (data.success) {
        setSections(data.sections);
        
        // Extract available sections for the dropdown
        const sectionNames = Object.keys(data.sections);
        if (sectionNames.length > 0) {
          setAvailableSections(sectionNames);
          setSection(sectionNames[0]);
        }
      } else {
        setError(data.message || "Помилка при завантаженні правил");
      }
    } catch (err) {
      setError("Не вдалося з'єднатися з сервером");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize rules if empty
  const handleInitRules = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/rules/init", {
        method: "POST",
        headers: { "is_admin": "1" } // Admin header
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchRules(); // Reload rules after initialization
        alert(data.message);
      } else {
        alert(data.message || "Помилка при ініціалізації правил");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new rule
  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "is_admin": "1" // Admin header
        },
        body: JSON.stringify({ title, content, section })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the sections state with the new rule
        const updatedSections = { ...sections };
        if (!updatedSections[section]) {
          updatedSections[section] = [];
        }
        updatedSections[section].push(data.rule);
        setSections(updatedSections);
        
        resetForm();
        alert("Правило успішно додано!");
      } else {
        alert(data.message || "Помилка при додаванні правила");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    }
  };

  // Update rule
  const handleUpdateRule = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/rules/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "is_admin": "1" // Admin header
        },
        body: JSON.stringify({ title, content, section })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update sections state
        fetchRules(); // Reload rules to get the correct order
        resetForm();
        alert("Правило успішно оновлено!");
      } else {
        alert(data.message || "Помилка при оновленні правила");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    }
  };

  // Delete rule
  const handleDeleteRule = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити це правило?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/rules/${id}`, {
        method: "DELETE",
        headers: { "is_admin": "1" } // Admin header
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update sections state by removing the deleted rule
        const updatedSections = { ...sections };
        Object.keys(updatedSections).forEach(sectionName => {
          updatedSections[sectionName] = updatedSections[sectionName].filter(rule => rule.id !== id);
        });
        setSections(updatedSections);
        
        alert("Правило успішно видалено!");
      } else {
        alert(data.message || "Помилка при видаленні правила");
      }
    } catch (err) {
      alert("Не вдалося з'єднатися з сервером");
      console.error(err);
    }
  };

  // Edit rule
  const handleEditClick = (rule) => {
    setIsEditing(true);
    setEditingId(rule.id);
    setTitle(rule.title);
    setContent(rule.content);
    setSection(rule.section);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Add new section
  const handleAddSection = () => {
    const newSection = prompt("Введіть назву нового розділу:");
    if (newSection && !availableSections.includes(newSection)) {
      setAvailableSections([...availableSections, newSection]);
      setSection(newSection);
      setShowForm(true);
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setSection(availableSections[0]);
    setShowForm(false);
  };

  if (loading) return <div className={styles.loader}>Завантаження правил...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Правила та академічна доброчесність</h1>
      </header>
      
      {admin && (
        <div className={styles.adminPanel}>
          <button 
            className={`${styles.button} ${styles.addButton}`} 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Скасувати" : "Додати правило"}
          </button>
          
          <button 
            className={`${styles.button} ${styles.addSectionButton}`} 
            onClick={handleAddSection}
          >
            Додати розділ
          </button>
          
          <button 
            className={`${styles.button} ${styles.initButton}`} 
            onClick={handleInitRules}
          >
            Ініціалізувати правила за замовчуванням
          </button>
        </div>
      )}

      {admin && showForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{isEditing ? "Редагувати правило" : "Додати нове правило"}</h2>
          <form onSubmit={isEditing ? handleUpdateRule : handleAddRule}>
            <div className={styles.formGroup}>
              <label htmlFor="section">Розділ:</label>
              <select
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={styles.formGroup}
                required
              >
                {availableSections.map((sect) => (
                  <option key={sect} value={sect}>
                    {sect}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">Заголовок:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.formGroup}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="content">Зміст:</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.formGroup}
                required
                rows={5}
              />
            </div>
            
            <div className={styles.formButtons}>
              <button type="submit" className={`${styles.button} ${styles.submitButton}`}>
                {isEditing ? "Оновити" : "Додати"}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  className={`${styles.button} ${styles.cancelButton}`}
                  onClick={resetForm}
                >
                  Скасувати
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className={styles.rulesSections}>
        {Object.keys(sections).length === 0 ? (
          <p>Немає правил для відображення</p>
        ) : (
          Object.entries(sections).map(([sectionName, rules]) => (
            <div key={sectionName} className={styles.section}>
              <h2 className={styles.sectionTitle}>{sectionName}</h2>
              
              <div className={styles.rulesList}>
                {rules.map((rule) => (
                  <div key={rule.id} className={styles.ruleItem}>
                    <h3>{rule.title}</h3>
                    <p>{rule.content}</p>
                    
                    {admin && (
                      <div className={styles.ruleActions}>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick(rule)}
                        >
                          Редагувати
                        </button>
                        
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          Видалити
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Rules;