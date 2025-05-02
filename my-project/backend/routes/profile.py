from flask import Blueprint, request, jsonify
from models import db, User
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint('/api/profile', __name__)

def save_avatar(file):
    upload_folder = r"E:\Repos\TS\my-project\temp"
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Очищаємо ім'я файлу для безпечного збереження
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    return filename

# 1) Отримання профілю користувача
@profile_bp.route("/api/profile", methods=["GET"])
def get_profile():
    """
    Заголовок: {
       Authorization: "Bearer <token>"
    }
    """
    token = request.args.get("token", "")
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")

    # Перевірка наявності користувача за email
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Несущий користувач"}), 401


    # Повертаємо дані користувача
    return jsonify({
        "email": user.email,
        "name": user.name,
        "nickname": user.nickname,
        "faculty": user.faculty,
        "group": user.group,
        "university": user.university,
        "rank": user.rank,
        "comments_count": user.comments_count,
        "feedbacks_count": user.feedbacks_count,
        "topics_count": user.topics_count
    }), 200

@profile_bp.route("/api/profile", methods=["PUT"])
def update_profile():
    token = request.args.get("token", "")
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Несущий користувач"}), 401

    # Отримуємо нові дані з тіла запиту
    data = request.get_json()

    changes_made = False
    # Оновлюємо дані користувача
    if "nickname" in data and data["nickname"] != user.nickname:
        user.nickname = data["nickname"]
        changes_made = True
    if "email" in data and data["email"] != user.email:
        user.email = data["email"]
        changes_made = True
    if "faculty" in data and data["faculty"] != user.faculty:
        user.faculty = data["faculty"]
        changes_made = True
    if "group" in data and data["group"] != user.group:
        user.group = data["group"]
        changes_made = True
    if "university" in data and data["university"] != user.university:
        user.university = data["university"]
        changes_made = True
    if "rank" in data and data["rank"] != user.rank:
        user.rank = data["rank"]
        changes_made = True

        # Перевіряємо наявність нової аватарки
    avatar_file = request.files.get('avatar')  # Отримуємо файл аватарки

    if avatar_file:
        avatar_filename = save_avatar(avatar_file)
        user.avatar = avatar_filename  # Оновлюємо аватарку в базі даних
        changes_made = True



    # Якщо зміни були, зберігаємо в базу
    if changes_made:
        db.session.commit()
        return jsonify({"message": "Профіль оновлено"}), 200
    else:
        # Якщо змін не було, повертаємо відповідь без змін
        return jsonify({"message": "Немає змін для збереження"}), 200
    