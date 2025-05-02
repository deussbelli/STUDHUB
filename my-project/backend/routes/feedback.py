from flask import Blueprint, request, jsonify
from models import db, Feedback, User, Comment  # Review приберемо, якщо його немає
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from flask import request, g
import openai
from dotenv import load_dotenv
import os

load_dotenv()

def censor_with_openai(text):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    prompt = (
        "Замінити всі матюки та образливі слова в наступному тексті на зірочки. "
        "Не змінювати сенс інших слів. Приклад: 'тупий' → '*****'. "
        f"\n\nТекст: {text}\n\nВиправлений текст:"
    )

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message["content"].strip()


feedback_bp = Blueprint("feedback_bp", __name__, url_prefix="/api/feedback")

# 1) Створення відгуку
@feedback_bp.route("/", methods=["POST"])
def create_feedback():
    """
    POST /api/feedback/
    FormData (бо з файлами):
    {
       token: ...,
       subject_type: ...,
       subject_name: ...,
       rating: ...,
       link: ...,
       feedback_text: ...,
       files[]: ...
    }
    """
    token = request.form.get("token", "")
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401
    
    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    user = User.query.filter_by(email=email).first()
    user.increment_feedbacks()

    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 401

    subject_type = request.form.get("subject_type", "")
    subject_name = request.form.get("subject_name", "")
    rating = request.form.get("rating", "0")
    link = request.form.get("link", "")
    feedback_text = request.form.get("feedback_text", "")
    feedback_text = censor_with_openai(feedback_text)

    new_feedback = Feedback(
        user_id=user.id,
        subject_type=subject_type,
        subject_name=subject_name,
        rating=rating,
        link=link,
        feedback_text=feedback_text
    )
    
    # Зберігаємо файли (якщо є)
    uploaded_files = request.files.getlist("files")
    file_paths = []
    for file in uploaded_files:
        if file:
            filename = secure_filename(file.filename)
            # Збереження в "uploads" або іншу вашу теку
            file_path = os.path.join('uploads', filename)
            file.save(file_path)
            file_paths.append(file_path)

    # Якщо вам потрібно зберігати file_paths у таблицю Feedback (поле files):
    # new_feedback.files = json.dumps(file_paths)   # наприклад, зберегти як JSON

    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({"success": True, "message": "Відгук збережено"}), 201


# 2) Отримати ВСІ відгуки (з фільтрами та пошуком)
@feedback_bp.route("/", methods=["GET"])
def get_all_feedback():
    """
    GET /api/feedback/?search=...&subject_type=...
    """
    search = request.args.get("search", "").strip()
    subject_filter = request.args.get("subject_type", "").strip()

    query = Feedback.query

    if subject_filter:
        query = query.filter(Feedback.subject_type == subject_filter)

    if search:
        query = query.filter(
            (Feedback.subject_name.like(f"%{search}%")) |
            (Feedback.feedback_text.like(f"%{search}%"))
        )

    query = query.order_by(Feedback.created_at.desc())
    feedbacks = query.all()

    feedback_list = []
    for f in feedbacks:
        feedback_list.append({
            "id": f.id,
            "subject_type": f.subject_type,
            "subject_name": f.subject_name,
            "rating": f.rating,
            "link": f.link,
            "feedback_text": f.feedback_text,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "user_id": f.user_id,
            "user_email": f.user.email if f.user else None,
            "likes": f.likes,
            "dislikes": f.dislikes,
            "reports": f.reports,
            # "files": f.files  # якщо у моделі є
        })
    return jsonify(feedback_list), 200


# 3) Отримати ВЛАСНІ відгуки
@feedback_bp.route("/me", methods=["GET"])
def get_my_feedback():
    """
    GET /api/feedback/me?token=...
    """
    token = request.args.get("token", "")
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 401

    reviews = Feedback.query.filter_by(user_id=user.id).order_by(Feedback.created_at.desc()).all()

    result = []
    for r in reviews:
        result.append({
            "id": r.id,
            "subject_type": r.subject_type,
            "subject_name": r.subject_name,
            "rating": r.rating,
            "link": r.link,
            "feedback_text": r.feedback_text,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    return jsonify(result), 200


# 4) Детальна інформація про відгук (із коментарями)
@feedback_bp.route("/<int:feedback_id>", methods=["GET"])
def get_feedback_detail(feedback_id):
    """
    GET /api/feedback/<feedback_id>
    """
    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({"error": "Відгук не знайдено"}), 404

    # Коментарі
    comments = Comment.query.filter_by(feedback_id=feedback_id).join(User).add_entity(User).order_by(Comment.created_at.asc()).all()

    feedback_dict = {
        "id": feedback.id,
        "subject_type": feedback.subject_type,
        "subject_name": feedback.subject_name,
        "rating": feedback.rating,
        "link": feedback.link,
        "feedback_text": feedback.feedback_text,
        "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
        "likes": feedback.likes,
        "dislikes": feedback.dislikes,
        "reports": feedback.reports,
        "comments": []
    }

    for c in comments:
        comment_obj, user_obj = c[0], c[1]
        feedback_dict["comments"].append({
            "id": comment_obj.id,
            "comment_text": comment_obj.comment_text,
            "created_at": comment_obj.created_at.isoformat() if comment_obj.created_at else None,
            "user_id": user_obj.id,
            "nickname": user_obj.nickname
        })

    return jsonify(feedback_dict), 200


# 5) Додати коментар до відгуку
@feedback_bp.route("/<int:feedback_id>/comment", methods=["POST"])
def add_comment(feedback_id):
    data = request.get_json()

    token = data.get("token", "")
    comment_text = data.get("comment_text", "").strip()
    comment_text = censor_with_openai(comment_text)

    if not comment_text:
        return jsonify({"error": "Порожній текст коментаря"}), 400

    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    user = User.query.filter_by(email=email).first()
    user.increment_comments()
    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 401

    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({"error": "Відгук не знайдено"}), 404

    new_comment = Comment(
        feedback_id=feedback_id,
        user_id=user.id,
        comment_text=comment_text
    )
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({"success": True, "message": "Коментар додано"}), 201


# Лайки / дислайки / репорти
@feedback_bp.route("/<int:feedback_id>/like", methods=["POST"])
def like_feedback(feedback_id):
    return update_feedback_counter(feedback_id, counter_field="likes")

@feedback_bp.route("/<int:feedback_id>/dislike", methods=["POST"])
def dislike_feedback(feedback_id):
    return update_feedback_counter(feedback_id, counter_field="dislikes")

@feedback_bp.route("/<int:feedback_id>/report", methods=["POST"])
def report_feedback(feedback_id):
    return update_feedback_counter(feedback_id, counter_field="reports")


def update_feedback_counter(feedback_id, counter_field):
    data = request.get_json()

    token = data.get("token", "")

    # Перевірка токена
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 401

    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({"error": "Відгук не знайдено"}), 404

    # Оновлення лічильника (likes/dislikes/reports)
    old_value = getattr(feedback, counter_field)
    if old_value is None:
        old_value = 0
    setattr(feedback, counter_field, old_value + 1)

    db.session.commit()

    return jsonify({"success": True, "message": f"{counter_field} +1"}), 200
