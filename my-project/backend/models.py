from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), default='abiturient')
    name = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    faculty = db.Column(db.String(255), default='')
    group = db.Column(db.String(255), default='')
    university = db.Column(db.String(255), default='')
    rank = db.Column(db.String(255), default='')
    verification_code = db.Column(db.String(255))
    verified = db.Column(db.Integer, default=0)
    is_admin = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    feedbacks_count = db.Column(db.Integer, default=0)
    topics_count = db.Column(db.Integer, default=0)     
    
    def increment_comments(self):
        self.comments_count += 1
        db.session.commit()

    def increment_feedbacks(self):
        self.feedbacks_count += 1
        db.session.commit()

    def increment_topics(self):
        self.topics_count += 1
        db.session.commit()


    def __repr__(self):
        return f"<User {self.nickname}>"


# Модель відгуку
class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_type = db.Column(db.String(255), nullable=False)
    subject_name = db.Column(db.String(255), default='')
    rating = db.Column(db.Integer, default=0)
    link = db.Column(db.String(255), default='')
    files = db.Column(db.String(255), default='')
    feedback_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='Відправлено')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    dislikes = db.Column(db.Integer, default=0)
    reports = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref=db.backref('feedbacks', lazy=True))

    def __repr__(self):
        return f"<Feedback {self.subject_name}>"


# Модель звернення
class Request(db.Model):
    __tablename__ = 'requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    request_type = db.Column(db.String(50), nullable=False)
    recipient = db.Column(db.String(255), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    attachments = db.Column(db.String(255), default='')
    status = db.Column(db.String(50), default='Відправлено')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('requests', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "request_type": self.request_type,
            "recipient": self.recipient,
            "topic": self.topic,
            "description": self.description,
            "attachments": self.attachments
        }

    def __repr__(self):
        return f"<Request {self.topic}>"


# Модель коментаря до відгуку
class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    feedback = db.relationship('Feedback', backref=db.backref('comments', lazy=True))
    user = db.relationship('User', backref=db.backref('comments', lazy=True))

    def __repr__(self):
        return f"<Comment {self.id}>"


# Модель тем форуму
class ForumTopic(db.Model):
    __tablename__ = 'forum_topics'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('forum_topics', lazy=True))

    def __repr__(self):
        return f"<ForumTopic {self.title}>"


# Модель коментаря до тем форуму
class ForumComment(db.Model):
    __tablename__ = 'forum_comments'

    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('forum_topics.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    topic = db.relationship('ForumTopic', backref=db.backref('forum_comments', lazy=True))
    user = db.relationship('User', backref=db.backref('forum_comments', lazy=True))

    def __repr__(self):
        return f"<ForumComment {self.id}>"
    
    # Модель оцінки відгуку (Review)
class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    feedback = db.relationship('Feedback', backref=db.backref('reviews', lazy=True))
    user = db.relationship('User', backref=db.backref('reviews', lazy=True))

    def __repr__(self):
        return f"<Review {self.rating} for Feedback {self.feedback_id}>"



# Нова модель Новин/Оголошень
class NewsItem(db.Model):
    __tablename__ = 'news_items'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(50), default='Адміністрація')  # 'Адміністрація' або 'МОН'
    url = db.Column(db.String(255), default='')  # URL для новин з МОН
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "source": self.source,
            "url": self.url,
            "created_at": self.created_at.strftime("%d.%m.%Y %H:%M"),
            "updated_at": self.updated_at.strftime("%d.%m.%Y %H:%M")
        }

    def __repr__(self):
        return f"<NewsItem {self.title}>"

# Нова модель Правил та доброчесності
class Rule(db.Model):
    __tablename__ = 'rules'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    section = db.Column(db.String(100), default='Загальні правила')  # розділ правил
    order = db.Column(db.Integer, default=0)  # порядок показу
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "section": self.section,
            "order": self.order,
            "created_at": self.created_at.strftime("%d.%m.%Y %H:%M"),
            "updated_at": self.updated_at.strftime("%d.%m.%Y %H:%M")
        }

    def __repr__(self):
        return f"<Rule {self.title}>"