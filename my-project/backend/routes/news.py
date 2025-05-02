# routes/news.py
from flask import Blueprint, request, jsonify
from models import db, NewsItem
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from flask import request, g

news_bp = Blueprint('news', __name__)

# Отримати всі новини/оголошення
@news_bp.route("/api/news", methods=["GET"])
def get_news():
    try:
        news = NewsItem.query.order_by(NewsItem.created_at.desc()).all()
        return jsonify({
            "success": True,
            "news": [item.to_dict() for item in news]
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Додати нове оголошення (тільки для адміністраторів)
@news_bp.route("/api/news", methods=["POST"])
def add_news():
    data = request.get_json()

    
    # Тут у реальному додатку треба перевірити, чи користувач є адміністратором,
    # використовуючи JWT або session. Для спрощення:
   
    try:
        news_item = NewsItem(
            title=data["title"],
            content=data["content"],
            source="Адміністрація",
        )
        db.session.add(news_item)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Оголошення додано успішно", 
            "news_item": news_item.to_dict()
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Оновити оголошення
@news_bp.route("/api/news/<int:news_id>", methods=["PUT"])
def update_news(news_id):
    data = request.get_json()

    
    try:
        news_item = NewsItem.query.get(news_id)
        if not news_item:
            return jsonify({"success": False, "message": "Оголошення не знайдено"}), 404
        
        news_item.title = data.get("title", news_item.title)
        news_item.content = data.get("content", news_item.content)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Оголошення оновлено", 
            "news_item": news_item.to_dict()
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Видалити оголошення
@news_bp.route("/api/news/<int:news_id>", methods=["DELETE"])
def delete_news(news_id):
    # Перевірка адміністратора
    admin_check = request.headers.get("is_admin")
    if not admin_check or admin_check != "1":
        return jsonify({"success": False, "message": "Недостатньо прав"}), 403
    
    try:
        news_item = NewsItem.query.get(news_id)
        if not news_item:
            return jsonify({"success": False, "message": "Оголошення не знайдено"}), 404
        
        db.session.delete(news_item)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Оголошення видалено"
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Парсинг новин з сайту МОН
@news_bp.route("/api/news/parse-osvita", methods=["POST"])
def parse_osvita_news():
    from bs4 import BeautifulSoup
    import requests

    MAX_NEWS = 30
    BASE_URL = "https://osvita.ua"
    LIST_URL_TEMPLATE = "https://osvita.ua/news/list/{}/"

    try:
        added_count = 0
        visited_urls = set()

        def parse_page(url):
            nonlocal added_count

            resp = requests.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            items = soup.select("li.publications-by-topic__item")

            for item in items:
                if added_count >= MAX_NEWS:
                    return False  # зупиняємо парсинг

                title_tag = item.select_one("a.publications-by-topic__link-name")
                desc_tag = item.select_one("span.publications-by-topic__link-description")
                url_path = title_tag.get("href") if title_tag else ""
                title = title_tag.text.strip() if title_tag else None
                description = desc_tag.text.strip() if desc_tag else "Перейдіть за посиланням для перегляду."
                full_url = f"{BASE_URL}{url_path}" if url_path.startswith("/") else url_path

                if not title or full_url in visited_urls:
                    continue

                visited_urls.add(full_url)

                # Перевірка, чи така новина вже є
                existing = NewsItem.query.filter_by(title=title, source="Освіта.ua").first()
                if existing:
                    continue

                news_item = NewsItem(
                    title=title,
                    content=description[:1500] + "..." if len(description) > 1500 else description,
                    source="Освіта.ua",
                    url=full_url
                )
                db.session.add(news_item)
                added_count += 1

            return True  # Продовжуємо парсити

        # Парсимо головну + сторінки list/20/, list/40/, ... поки не 1500
        page_offsets = [0] + list(range(20, 10000, 20))  # 0 = головна сторінка
        for offset in page_offsets:
            url = BASE_URL + "/news/" if offset == 0 else LIST_URL_TEMPLATE.format(offset)
            should_continue = parse_page(url)
            if not should_continue:
                break

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Додано {added_count} новин з сайту osvita.ua"
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
