
# routes/rules.py
from flask import Blueprint, request, jsonify
from models import db, Rule
from flask import request, g

rules_bp = Blueprint('rules', __name__)

# Отримати всі правила, відсортовані за розділами та порядком
@rules_bp.route("/api/rules", methods=["GET"])
def get_rules():
    try:
        rules = Rule.query.order_by(Rule.section, Rule.order).all()
        
        # Групуємо правила за розділами
        sections = {}
        for rule in rules:
            section = rule.section
            if section not in sections:
                sections[section] = []
            sections[section].append(rule.to_dict())
        
        return jsonify({
            "success": True,
            "sections": sections
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Додати нове правило (тільки для адміністраторів)
@rules_bp.route("/api/rules", methods=["POST"])
def add_rule():
    data = request.get_json()

        
    try:
        # Знаходимо максимальний порядок у розділі
        max_order = db.session.query(db.func.max(Rule.order)).filter(
            Rule.section == data.get("section", "Загальні правила")
        ).scalar() or 0
        
        rule = Rule(
            title=data["title"],
            content=data["content"],
            section=data.get("section", "Загальні правила"),
            order=max_order + 1
        )
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Правило додано успішно", 
            "rule": rule.to_dict()
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Оновити правило
@rules_bp.route("/api/rules/<int:rule_id>", methods=["PUT"])
def update_rule(rule_id):
    data = request.get_json()
    
    try:
        rule = Rule.query.get(rule_id)
        if not rule:
            return jsonify({"success": False, "message": "Правило не знайдено"}), 404
        
        rule.title = data.get("title", rule.title)
        rule.content = data.get("content", rule.content)
        rule.section = data.get("section", rule.section)
        
        if "order" in data:
            rule.order = data["order"]
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Правило оновлено", 
            "rule": rule.to_dict()
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Видалити правило
@rules_bp.route("/api/rules/<int:rule_id>", methods=["DELETE"])
def delete_rule(rule_id):
    
    try:
        rule = Rule.query.get(rule_id)
        if not rule:
            return jsonify({"success": False, "message": "Правило не знайдено"}), 404
        
        db.session.delete(rule)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Правило видалено"
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Ініціалізувати таблицю правил стандартними правилами (якщо порожня)
@rules_bp.route("/api/rules/init", methods=["POST"])
def init_rules():
    
    try:
        # Перевіряємо, чи таблиця порожня
        rule_count = Rule.query.count()
        if rule_count > 0:
            return jsonify({
                "success": False, 
                "message": "Таблиця правил не порожня. Ініціалізація відхилена."
            })
        
        # Додаємо стандартні правила
        default_rules = [
            {
                "title": "Загальні правила StudHub",
                "content": "StudHub - це платформа для студентів та абітурієнтів, де всі користувачі повинні дотримуватися правил взаємоповаги та професійності. Забороняється використання ненормативної лексики, образ, дискримінаційних висловлювань та розміщення забороненого контенту.",
                "section": "Загальні правила",
                "order": 1
            },
            {
                "title": "Про верифікацію облікових записів",
                "content": "Для повного доступу до функцій платформи необхідно пройти верифікацію. Студенти та викладачі повинні використовувати корпоративну пошту закладу освіти (.edu.ua). Інші категорії користувачів можуть використовувати особисту пошту.",
                "section": "Загальні правила",
                "order": 2
            },
            {
                "title": "Основні принципи академічної доброчесності",
                "content": "Академічна доброчесність - це сукупність етичних принципів та правил, якими мають керуватися учасники освітнього процесу під час навчання та досліджень. Основні принципи включають: чесність, довіру, справедливість, повагу, відповідальність та мужність.",
                "section": "Академічна доброчесність",
                "order": 1
            },
            {
                "title": "Запобігання плагіату",
                "content": "Плагіат - це привласнення авторства на чужий твір чи на чужі ідеї, видання чужого твору за свій. При використанні чужих ідей, думок, або цитат, необхідно робити відповідні посилання на джерела. Запобігання плагіату - важлива складова академічної доброчесності.",
                "section": "Академічна доброчесність",
                "order": 2
            },
            {
                "title": "Відповідальність за порушення доброчесності",
                "content": "За порушення принципів академічної доброчесності можуть бути застосовані різні форми відповідальності: від повторного проходження оцінювання до відрахування з навчального закладу. Кожен університет має свої внутрішні положення щодо академічної доброчесності.",
                "section": "Академічна доброчесність",
                "order": 3
            }
        ]
        
        for rule_data in default_rules:
            rule = Rule(
                title=rule_data["title"],
                content=rule_data["content"],
                section=rule_data["section"],
                order=rule_data["order"]
            )
            db.session.add(rule)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": f"Таблицю правил ініціалізовано {len(default_rules)} записами"
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})