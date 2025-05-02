# StudHub Project
---
StudHub is a web platform for students, applicants, and university staff to share feedback, post forum topics, submit requests, and stay updated with news and academic rules.
It is designed to improve communication, transparency, and integrity within the educational community.

You can see the **project presentation here:**  
[📄 Canva Presentation](https://www.canva.com/design/DAGj2FsZ6TI/XqhxaVO15PUyn5hkY7ndxg/view?utm_content=DAGj2FsZ6TI&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h58fa42e790#6)

This repository contains the **StudHub** system, which includes:

✅ A **React + Vite frontend**  
✅ A **Flask backend** with SQLAlchemy and SQLite database  

---

## 🔍 Main Features

- **User accounts with verification**
    - Register using email or institutional `.edu.ua` email
    - Verify accounts via email
    - Login via password or Azure AD SSO
- **Feedback system**
    - Leave reviews on teachers, courses, or other topics
    - Add ratings, links, attachments, and comments
    - Like, dislike, or report feedback items
- **Forum**
    - Create public topics by category
    - Participate in threaded discussions
    - Search by keywords or filter by category
- **Formal requests**
    - Submit official requests to university administration
    - Track the status of submitted requests
- **News & announcements**
    - Stay informed about administrative and educational updates
    - Includes automated parsing of news from external sources (like osvita.ua)
- **Rules and academic integrity**
    - Access a structured set of rules and guidelines
    - Organized by section for clarity

---

## Project Structure

- **Backend (`/backend`)**  
  Runs the Flask server with user management, forum, feedback, requests, news, and rules modules.

- **Frontend (`/frontend`)**  
  A React + Vite web app with pages like home, login, registration, forum, feedback, and more.

---

## Requirements

- Python 3.x  
- Node.js (with npm)  
- SQLite (bundled)  

---

## Backend Setup

```bash
cd my-project/backend
python app.py
```

This will:
- Start the Flask server
- Initialize the SQLite database (`main.db`)
- Seed demo data (30 users, feedbacks, requests, topics, comments)

The server listens on `http://localhost:5000`.

---

## Frontend Setup

```bash
cd my-project/frontend
npm install
npm start
```

This will:
- Start the React + Vite app with hot module reload (HMR)  
- Open the app on `http://localhost:5173`

---

## Technologies Used

### Backend
- Flask + Flask-CORS
- SQLAlchemy
- SQLite
- MSAL (Azure AD SSO integration)
- Faker (for demo data)
- smtplib (for email verification)

### Frontend
- React + Vite
- React Router
- ESLint (basic rules; can be expanded)
- Optional: TypeScript (recommended for production)

---

## Key Features

- User registration and email verification
- Login (email/password + Azure AD SSO)
- Submit feedback with ratings, comments, and attachments
- Forum with topics and threaded comments
- Submit formal requests
- News and announcements management
- Rules and academic integrity sections
- Admin features (flagged by `is_admin`)

---

## Notes

✅ **Email Setup**: Update `SMTP_USER` and `SMTP_PASSWORD` in `backend/app.py` for real email delivery.

✅ **Azure AD Setup**: Replace `CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID` in `backend/app.py` for working SSO.

✅ **Database**: To reinitialize, delete `main.db` and restart the backend (`python app.py`).

---

## Scripts

- **Initialize Database**  
  Uses `init_db.sql` (if available) or SQLAlchemy `db.create_all()`.

- **Seed Fake Data**  
  Automatically runs when backend starts.

---

```

Copyright (c) 2025 StudHub | Anastasiia Nachynka, Liliia Pushkar, Martyn Demian

```

---
