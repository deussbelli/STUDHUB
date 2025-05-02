-- Видаляємо таблиці (якщо існують)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS forum_comments;
DROP TABLE IF EXISTS forum_topics;

-- Створюємо таблицю users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT DEFAULT 'abiturient',
    name TEXT NOT NULL,
    nickname TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    faculty TEXT DEFAULT '',
    "group" TEXT DEFAULT '',
    university TEXT DEFAULT '',
    rank TEXT DEFAULT '',
    verification_code TEXT,
    verified INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0
);


-- Таблиця feedback (відгуки)
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    subject_type TEXT NOT NULL,     -- (викладачі, курси, факультети, університети, ...)
    subject_name TEXT DEFAULT '',   -- уточнення (назва викладача, факультету тощо)
    rating INTEGER DEFAULT 0,       -- рейтинг
    link TEXT DEFAULT '',           -- додаткове посилання
    files TEXT DEFAULT '',          -- шляхи до завантажених файлів (JSON або csv)

    feedback_text TEXT NOT NULL,    -- основний текст відгуку
    status TEXT DEFAULT 'Відправлено',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    reports INTEGER DEFAULT 0,

    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Таблиця requests (звернення)
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    request_type TEXT NOT NULL,   -- (запит/скарга/пропозиція тощо)
    recipient TEXT NOT NULL,
    topic TEXT NOT NULL,
    description TEXT NOT NULL,
    attachments TEXT DEFAULT '',
    status TEXT DEFAULT 'Відправлено',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Таблиця comments (коментарі до відгуків)
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(feedback_id) REFERENCES feedback(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);



-- Таблиця тем форуму
CREATE TABLE forum_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблиця коментарів (відповідей) до тем
CREATE TABLE forum_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES forum_topics(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

