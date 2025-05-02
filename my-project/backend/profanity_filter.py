# profanity_filter.py
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def clean_with_openai(text: str) -> str:
    try:
        prompt = f"""
        Ти фільтр токсичних висловлювань, матюків та агресії на всіх мовах.
        Завдання:
        - Замінити всі нецензурні або принизливі слова на нейтральні синоніми без лайки.
        - Зробити текст доброзичливим і лояльним, якщо він агресивний.

        Оригінальний текст:
        \"{text}\"

        Поверни лише змінений текст без додаткових коментарів.
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[ERROR] Failed to clean text via OpenAI: {e}")
        return text

def sanitize_text(text: str) -> str:
    return clean_with_openai(text)