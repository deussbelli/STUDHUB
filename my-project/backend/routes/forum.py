from flask import Blueprint, request, jsonify
from models import db, Feedback, User, Comment, ForumTopic, ForumComment
from datetime import datetime
from flask import request, g

from dotenv import load_dotenv
from .feedback import censor_with_openai


forum_bp = Blueprint('/api/forum', __name__)

@forum_bp.route("/api/forum", methods=["GET"])
def get_forum_topics():
    """
    Повертає всі теми з їх автором (user), відсортовані за датою (новіші зверху).
    Параметри (необов'язкові):
       ?search=...  (пошук по назві або категорії)
       ?category=...
    """
    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip().lower()

    topics_query = ForumTopic.query.join(User).with_entities(
        ForumTopic.id, ForumTopic.title, ForumTopic.description, ForumTopic.category,
        ForumTopic.user_id, ForumTopic.created_at, User.nickname, User.name, User.email
    )

    if search:
        topics_query = topics_query.filter(
            (ForumTopic.title.ilike(f"%{search}%")) | (ForumTopic.category.ilike(f"%{search}%"))
        )

    if category:
        topics_query = topics_query.filter(ForumTopic.category.ilike(f"%{category}%"))

    topics_query = topics_query.order_by(ForumTopic.created_at.desc())
    
    topics = [
        {
            "id": topic.id,
            "title": topic.title,
            "description": topic.description,
            "category": topic.category,
            "user_id": topic.user_id,
            "created_at": topic.created_at,
            "user": {
                "nickname": topic.nickname,
                "name": topic.name,
                "email": topic.email
            }
        }
        for topic in topics_query.all()
    ]
    
    return jsonify(topics)


@forum_bp.route("/api/forum", methods=["POST"])
def create_forum_topic():
    """
    Створити нову тему. Потрібен token у JSON body:
      {
         token: "fake-jwt-token-for-... або fake-jwt-token-azure-..."
         title: "...",
         description: "...",
         category: "..."
      }
    """
    data = request.get_json()

    token = data.get("token", "")
    title = data.get("title", "").strip()
    title = censor_with_openai(title)
    description = data.get("description", "").strip()
    description = censor_with_openai(description)
    category = data.get("category", "Загальне").strip()


    # Перевірка на валідний токен
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")

    # Перевірка наявності користувача за email
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Несущ. користувач"}), 401
    user.increment_topics()

    # Перевірка полів
    if not title:
        return jsonify({"error": "Поле 'title' обов'язкове"}), 400

    # Створення нової теми
    new_topic = ForumTopic(
        title=title,
        description=description,
        category=category,
        user_id=user.id,
        created_at=datetime.utcnow()
    )
    db.session.add(new_topic)
    db.session.commit()

    # Повернення створеної теми
    db.session.refresh(new_topic)

    topic_data = {
        "id": new_topic.id,
        "title": new_topic.title,
        "description": new_topic.description,
        "category": new_topic.category,
        "user_id": new_topic.user_id,
        "created_at": new_topic.created_at,
        "user": {
            "nickname": user.nickname,
            "name": user.name,
            "email": user.email
        }
    }

    return jsonify(topic_data), 201


@forum_bp.route("/api/forum/<int:topic_id>", methods=["GET"])
def get_forum_topic(topic_id):
    """
    Повертає одну тему за ID + список коментарів.
    """
    # Отримуємо тему
    topic = ForumTopic.query.join(User).with_entities(
        ForumTopic.id, ForumTopic.title, ForumTopic.description, ForumTopic.category,
        ForumTopic.user_id, ForumTopic.created_at, User.nickname, User.name, User.email
    ).filter(ForumTopic.id == topic_id).first()

    if not topic:
        return jsonify({"error": "Тему не знайдено"}), 404

    topic_data = {
        "id": topic.id,
        "title": topic.title,
        "description": topic.description,
        "category": topic.category,
        "user_id": topic.user_id,
        "created_at": topic.created_at,
        "user": {
            "nickname": topic.nickname,
            "name": topic.name,
            "email": topic.email
        }
    }

    # Отримуємо коментарі
    comments = ForumComment.query.join(User).with_entities(
        ForumComment.id, ForumComment.topic_id, ForumComment.user_id,
        ForumComment.content, ForumComment.created_at, User.nickname, User.name, User.email
    ).filter(ForumComment.topic_id == topic_id).order_by(ForumComment.created_at.asc()).all()

    replies = [
        {
            "id": comment.id,
            "topic_id": comment.topic_id,
            "user_id": comment.user_id,
            "content": comment.content,
            "created_at": comment.created_at,
            "user": {
                "nickname": comment.nickname,
                "name": comment.name,
                "email": comment.email
            }
        }
        for comment in comments
    ]

    topic_data["replies"] = replies
    return jsonify(topic_data)


@forum_bp.route("/api/forum/<int:topic_id>/comment", methods=["POST"])
def add_forum_comment(topic_id):
    """
    Додає коментар до теми.
    Потрібен token у JSON body:
      {
         token: "fake-jwt-token-...",
         content: "Текст коментаря"
      }
    """
    data = request.get_json()

    token = data.get("token", "")
    content = data.get("content", "").strip()
    content = censor_with_openai(content)

    if not content:
        return jsonify({"error": "Поле 'content' не може бути порожнім"}), 400

    # Перевірка токена
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")

    # Перевірка наявності користувача
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Несущ. користувач"}), 401
    user.increment_comments()

    # Перевірка наявності теми
    topic = ForumTopic.query.filter_by(id=topic_id).first()
    if not topic:
        return jsonify({"error": "Тему не знайдено"}), 404

    # Створення коментаря
    new_comment = ForumComment(
        topic_id=topic_id,
        user_id=user.id,
        content=content,
        created_at=datetime.utcnow()
    )
    db.session.add(new_comment)
    db.session.commit()

    db.session.refresh(new_comment)

    comment_data = {
        "id": new_comment.id,
        "topic_id": new_comment.topic_id,
        "user_id": new_comment.user_id,
        "content": new_comment.content,
        "created_at": new_comment.created_at,
        "user": {
            "nickname": user.nickname,
            "name": user.name,
            "email": user.email
        }
    }

    return jsonify(comment_data), 201