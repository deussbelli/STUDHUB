from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
import sqlite3
import msal  # для інтеграції з Azure AD (SSO)
import uuid
import os
import re
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from routes.forum import forum_bp  # Імпортуйте ваш Blueprint
from routes.feedback import feedback_bp
from routes.request import request_bp
from routes.search import search_bp
from routes.news import news_bp
from routes.rules import rules_bp
from routes.profile import profile_bp
import requests  # Для парсингу
from bs4 import BeautifulSoup  # Для парсингу HTML
from datetime import datetime
from flask import request, g
from models import User, Feedback, Request, Comment, ForumTopic, ForumComment
from faker import Faker
from models import db, User, NewsItem

# Замініть на свої реальні дані
SMTP_HOST = "smtp.gmail.com"       # або інший хост, якщо не Gmail
SMTP_PORT = 465                    # 465 для SSL; 587 для TLS
SMTP_USER = ""   # замініть на свій емейл
SMTP_PASSWORD = ""


UPLOAD_FOLDER = r"E:\Repos\TS\my-project\temp"  # куди зберігати файли
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)
app.secret_key = "YOUR_SECRET_KEY"  # замініть на ваш секретний ключ

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])



# Якщо хочете ініціалізувати таблиці через models.py:
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///E:/Repos/TS/my-project/backend/main.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Якщо хочете запускати також свій SQL-скрипт (init_db.sql):
DB_PATH = r"E:\Repos\TS\my-project\backend\main.db"
INIT_SCRIPT_PATH = r"E:\Repos\TS\my-project\backend\init_db.sql"

def init_db():
    with open(INIT_SCRIPT_PATH, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.executescript(sql_script)
        conn.commit()

# ------------------------
# Налаштування для Azure AD (спростена версія)
# ------------------------
CLIENT_ID = ""     # приклад
CLIENT_SECRET = ""  # приклад
TENANT_ID = ""    # приклад
REDIRECT_URI = ""
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["User.Read"]


# Реєструємо блупринти
app.register_blueprint(forum_bp)
app.register_blueprint(feedback_bp)
app.register_blueprint(request_bp)
app.register_blueprint(search_bp)
app.register_blueprint(news_bp)
app.register_blueprint(rules_bp)
app.register_blueprint(profile_bp)

@app.route("/")
def index():
    return "Backend for StudHub"


# ------------------------
# Генерація верифікаційного коду
# ------------------------
def generate_verification_code(length=7):
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(length))

# ------------------------
# Ендпоінт входу через Azure AD (SSO)
# ------------------------
@app.route("/auth/azure")
def azure_login():
    session["state"] = str(uuid.uuid4())
    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    auth_url = msal_app.get_authorization_request_url(
        scopes=SCOPE,
        state=session["state"],
        redirect_uri=REDIRECT_URI
    )
    return redirect(auth_url)


@app.route("/auth/azure/callback")
def azure_callback():
    if request.args.get('state') != session.get("state"):
        return "State mismatch", 400

    code = request.args.get('code')
    if not code:
        return "No code in request", 400

    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )

    if "access_token" in result:
        user_info = result.get("id_token_claims", {})
        email = user_info.get("preferred_username", "")
        name = user_info.get("name", "AzureUser")

        # 1. Перевірити, чи є такий користувач у базі
        user = User.query.filter_by(email=email).first()

        # 2. Якщо немає, створимо його AUTOMATICALLY
        if not user:
            role = "teacher"
            faculty = "AzureFaculty"
            verification_code = None
            verified = 1

            new_user = User(
                role=role,
                name=name,
                nickname=name,
                email=email,
                password="",
                faculty=faculty,
                group="",
                university="",
                rank="SSO",
                verification_code=verification_code,
                verified=verified
            )

            db.session.add(new_user)
            db.session.commit()

        # 3. Генеруємо тестовий токен і редіректимо
        fake_token = f"fake-jwt-token-azure-{email}"
        redirect_url = f"http://localhost:5173?token={fake_token}"
        return redirect(redirect_url)
    else:
        return "Помилка авторизації через Azure", 400


@app.route("/users")
def list_users():
    users = User.query.all()
    users_data = [
        {
            "id": user.id,
            "nickname": user.nickname,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]
    return jsonify(users_data)


# ------------------------
# API для логіну (через звичайну пошту і пароль)
# ------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    # Знаходимо користувача за email і паролем
    user = User.query.filter_by(email=data["email"], password=data["password"]).first()

    if user:
        if not user.verified:
            return jsonify({"error": "Ваш акаунт не верифікований! Перевірте пошту."}), 403
        
        # Повертаємо token і is_admin
        return jsonify({
            "token": f"fake-jwt-token-for-{user.email}",
            "is_admin": user.is_admin  # 0 або 1
        })
    else:
        return jsonify({"error": "Невірний логін або пароль"}), 401



# ------------------------
# API для реєстрації
# ------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    role = data.get("role", "abiturient")
    email = data["email"].strip()

    if role in ["student", "teacher"]:
        pattern = r".+@.+\.edu\.ua$"
        if not re.match(pattern, email):
            return jsonify({
                "success": False,
                "message": "Для студентів та викладачів потрібна корпоративна пошта (.edu.ua)!"
            })

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"success": False, "message": "Email вже зареєстровано"})

    nickname = data["nickname"]
    existing_nickname = User.query.filter_by(nickname=nickname).first()
    if existing_nickname:
        return jsonify({"success": False, "message": "Нік вже зайнятий"})

    try:
        verification_code = generate_verification_code(7)
        new_user = User(
            role=role,
            name=data["name"],
            nickname=nickname,
            email=email,
            password=data["password"],
            faculty=data.get("faculty", ""),
            group=data.get("group", ""),
            university=data.get("university", ""),
            rank=data.get("rank", ""),
            verification_code=verification_code,
            verified=0
        )

        db.session.add(new_user)
        db.session.commit()

        subject = "StudHub - Підтвердження реєстрації"
        body = (
            f"Вітаємо, {data['name']}!\n\n"
            f"Ваш код верифікації: {verification_code}\n"
            "Будь ласка, введіть цей код на сторінці верифікації, "
            "щоб завершити реєстрацію.\n\n"
            "З повагою,\n"
            "Команда StudHub"
        )

        message = MIMEMultipart()
        message["From"] = SMTP_USER
        message["To"] = email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(message)
            print(f"[INFO] Лист із кодом відправлено на {email}")

        except smtplib.SMTPException as mail_error:
            print(f"[ERROR] Не вдалося відправити лист: {mail_error}")
            return jsonify({"success": False, "message": "Не вдалося відправити лист верифікації."})

        return jsonify({"success": True, "message": "Користувача зареєстровано. Перевірте пошту для підтвердження."})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# ------------------------
# API для підтвердження коду верифікації
# ------------------------
@app.route("/api/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json()

    email = data["email"]
    code = data["verification_code"]

    user = User.query.filter_by(email=email, verification_code=code).first()

    if not user:
        return jsonify({"success": False, "message": "Невірний код або email"})

    user.verified = 1
    db.session.commit()

    return jsonify({"success": True, "message": "Email підтверджено! Тепер ви можете увійти."})


def seed_fake_data():
    from models import User, Feedback, Request, Comment, ForumTopic, ForumComment
    from faker import Faker

    fake = Faker("uk_UA")

    # Очистити всі таблиці
    Comment.query.delete()
    ForumComment.query.delete()
    ForumTopic.query.delete()
    Feedback.query.delete()
    Request.query.delete()
    User.query.delete()
    db.session.commit()

    users = []

    # Створюємо 30 унікальних користувачів
    for i in range(30):
        is_admin = 1 if i < 5 else 0
        user = User(
            role="student",
            name=fake.name(),
            nickname=f"user_{i}",
            email=f"user_{i}@example.com",
            password="password",
            faculty="Факультет Інформатики",
            group="Група-101",
            university="Університет StudHub",
            rank="Студент",
            verification_code=None,
            verified=1,
            is_admin=is_admin
        )
        db.session.add(user)
        users.append(user)
    db.session.commit()

    # Створюємо 30 відгуків
    for _ in range(30):
        user = random.choice(users)
        feedback = Feedback(
            user_id=user.id,
            subject_type="викладач",
            subject_name=fake.name(),
            rating=random.randint(1, 5),
            link="https://example.com",
            feedback_text=fake.paragraph(nb_sentences=3)
        )
        db.session.add(feedback)
    db.session.commit()

    # Створюємо 30 звернень
    for _ in range(30):
        user = random.choice(users)
        request_obj = Request(
            user_id=user.id,
            request_type="запит",
            recipient="Адміністрація",
            topic=fake.sentence(nb_words=5),
            description=fake.text()
        )
        db.session.add(request_obj)
    db.session.commit()

    # Створюємо 30 тем форуму
    topics = []
    for _ in range(30):
        user = random.choice(users)
        topic = ForumTopic(
            title=fake.sentence(nb_words=4),
            description=fake.text(),
            category="Загальне",
            user_id=user.id
        )
        db.session.add(topic)
        topics.append(topic)
    db.session.commit()

    # Створюємо 30 коментарів до тем
    for _ in range(30):
        user = random.choice(users)
        topic = random.choice(topics)
        comment = ForumComment(
            topic_id=topic.id,
            user_id=user.id,
            content=fake.sentence()
        )
        db.session.add(comment)
    db.session.commit()

    # Створюємо 30 коментарів до відгуків
    feedbacks = Feedback.query.all()
    for _ in range(30):
        user = random.choice(users)
        fb = random.choice(feedbacks)
        comment = Comment(
            feedback_id=fb.id,
            user_id=user.id,
            comment_text=fake.sentence()
        )
        db.session.add(comment)
    db.session.commit()

    print("[INFO] Демодані успішно згенеровані.")


# ------------------------
# Запуск Flask
# ------------------------
if __name__ == "__main__":
    # Якщо хочете використовувати SQLAlchemy та моделі з models.py — створюємо таблиці
    with app.app_context():
        db.create_all()        
        seed_fake_data()

    app.run(debug=True)
