from flask import Blueprint, request, jsonify
from models import db, User, Request
from flask import request, g

# Тут ми даємо блупрінту назву "requests_bp",
# а url_prefix — '/api/requests' (щоб усі маршрути починалися з /api/requests).
from flask_cors import CORS

request_bp = Blueprint("requests_bp", __name__)
CORS(request_bp)


@request_bp.route("/api/requests", methods=["POST"])
def create_request():
    """
    Створення звернення:
    POST /api/requests/
    {
      "token": "fake-jwt-token-for-... or fake-jwt-token-azure-...",
      "request_type": "...",
      "recipient": "...",
      "topic": "...",
      "description": "...",
      "attachments": "..."
    }
    """
    data = request.get_json()

    token = data.get("token", "")
    
    # Перевірка токена
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    
    # Перевірка наявності користувача
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Несущ. користувач"}), 401

    # Створення запиту
    new_request = Request(
        user_id=user.id,
        request_type=data.get("request_type", ""),
        recipient=data.get("recipient", ""),
        topic=data.get("topic", ""),
        description=data.get("description", ""),
        attachments=data.get("attachments", "")
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Звернення створено"}), 201


@request_bp.route("/api/requests/me", methods=["GET"])
def get_my_requests():
    """
    GET /api/requests/me?token=fake-jwt-token-for-...
    Повертає всі звернення конкретного користувача
    """
    token = request.args.get("token", "")
    
    # Перевірка токена
    if not (token.startswith("fake-jwt-token-for-") or token.startswith("fake-jwt-token-azure-")):
        return jsonify({"error": "Немає валідного токена"}), 401

    email = token.replace("fake-jwt-token-for-", "").replace("fake-jwt-token-azure-", "")
    
    # Перевірка наявності користувача
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Несущ. користувач"}), 401

    # Отримання всіх звернень користувача
    user_requests = Request.query.filter_by(user_id=user.id).all()

    # Якщо у вашій моделі Request є метод to_dict(), можна викликати:
    # return jsonify([r.to_dict() for r in user_requests])

    # Або вручну сформувати список словників
    results = []
    for r in user_requests:
        results.append({
            "id": r.id,
            "request_type": r.request_type,
            "recipient": r.recipient,
            "topic": r.topic,
            "description": r.description,
            "attachments": r.attachments,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    return jsonify(results), 200
