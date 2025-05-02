# routes/search.py
from flask import Blueprint, request, jsonify
import sqlite3
import datetime
from flask import request, g

search_bp = Blueprint("search_bp", __name__)

@search_bp.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()
    content_type = request.args.get("contentType", "").strip()
    category = request.args.get("category", "").strip()
    period = request.args.get("period", "").strip()
    sort = request.args.get("sort", "").strip()

    # Підключення до вашої БД (шлях замінити на свій)
    conn = sqlite3.connect(r"E:\Repos\TS\my-project\backend\main.db")
    cursor = conn.cursor()

    results = []

    # ----------------------------------------------------
    # Приклад: пошук у таблиці "forum_topics"
    # ----------------------------------------------------
    # Якщо content_type порожній (""), шукаємо у всіх
    # або шукаємо, якщо content_type == "articles" (для прикладу)
    if content_type in ["", "articles"]:
        sql_forum = """
            SELECT id, title, description, created_at
            FROM forum_topics
            WHERE (title LIKE ? OR description LIKE ?)
        """
        params_forum = [f"%{query}%", f"%{query}%"]

        # (Якщо треба ще фільтрацію по category)
        # if category:
        #     sql_forum += " AND category = ?"
        #     params_forum.append(category)

        cursor.execute(sql_forum, params_forum)
        rows_forum = cursor.fetchall()
        for row in rows_forum:
            results.append({
                "type": "forum_topic",
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "created_at": row[3],
            })

    # ----------------------------------------------------
    # Приклад: пошук у таблиці "feedback" (наприклад, відгуки)
    # ----------------------------------------------------
    if content_type in ["", "reviews"]:
        sql_feedback = """
            SELECT id, feedback_text, created_at
            FROM feedback
            WHERE feedback_text LIKE ?
        """
        params_feedback = [f"%{query}%"]

        cursor.execute(sql_feedback, params_feedback)
        rows_feedback = cursor.fetchall()
        for row in rows_feedback:
            results.append({
                "type": "feedback",
                "id": row[0],
                "feedback_text": row[1],
                "created_at": row[2],
            })

    # ----------------------------------------------------
    # Якщо у вас є ще інші таблиці, наприклад "news" і т.д.,
    # додавайте їх аналогічно
    # ----------------------------------------------------

    # ----------------------------------------------------
    # Фільтрація за періодом (last7days, last30days, ...)
    # Припустимо, що поле created_at зберігає дату у форматі:
    # "YYYY-MM-DD HH:MM:SS"
    # ----------------------------------------------------
    def parse_date(date_str):
        try:
            return datetime.datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except:
            # Якщо дата не в потрібному форматі
            return datetime.datetime(1970, 1, 1)

    now = datetime.datetime.now()
    if period == "last7days":
        boundary_date = now - datetime.timedelta(days=7)
        results = [r for r in results if parse_date(r["created_at"]) >= boundary_date]
    elif period == "last30days":
        boundary_date = now - datetime.timedelta(days=30)
        results = [r for r in results if parse_date(r["created_at"]) >= boundary_date]
    # ... інші варіанти періоду

    # ----------------------------------------------------
    # Сортування (за датою, за популярністю тощо)
    # ----------------------------------------------------
    if sort == "date_desc":
        results.sort(key=lambda x: parse_date(x["created_at"]), reverse=True)
    elif sort == "date_asc":
        results.sort(key=lambda x: parse_date(x["created_at"]))

    # Закриваємо коннект
    cursor.close()
    conn.close()

    # Повертаємо результати
    return jsonify(results)
