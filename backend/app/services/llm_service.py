import json
import re

from openai import AsyncOpenAI

from app.config import settings
from app.models import (
    ChatRequest, ChatResponse, ChatNewsArticle,
    TranslateRequest, TranslateResponse, TranslateCorrection,
)
from app.prompts import build_system_prompt
from app.services.search_service import search_web, search_news


client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

NEWS_KEYWORDS = [
    "news", "latest", "headlines", "what's happening", "current events",
    "breaking", "trending",
    "أخبار", "عاجل", "آخر",
    "noticias", "actualidad",
    "nouvelles", "actualités",
    "nachrichten", "neuigkeiten",
    "notizie",
    "notícias",
    "ニュース", "最新",
    "뉴스", "최신",
    "新闻", "最新",
]

CANT_ANSWER_PHRASES = [
    "i don't have access", "i can't provide real-time", "i don't have real-time",
    "my knowledge", "i'm not able to", "i cannot access",
    "i don't have current", "i can't browse", "i'm unable to",
    "as an ai", "i don't have the ability",
]


def _is_news_request(message: str) -> bool:
    lower = message.lower()
    return any(kw in lower for kw in NEWS_KEYWORDS)


def _needs_web_search(response_text: str, parsed_data: dict | None = None) -> bool:
    """Check if the LLM indicated it needs a web search."""
    if parsed_data and parsed_data.get("needs_search"):
        return True
    lower = response_text.lower()
    return any(phrase in lower for phrase in CANT_ANSWER_PHRASES)


def _parse_json_response(text: str) -> dict:
    """Parse JSON from LLM response, handling possible code fences."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


async def _call_llm(messages: list[dict]) -> str:
    response = await client.chat.completions.create(
        model="openai/gpt-oss-120b",
        max_tokens=1024,
        messages=messages,
    )
    return response.choices[0].message.content or ""


async def get_response(request: ChatRequest) -> ChatResponse:
    articles: list[ChatNewsArticle] = []

    system_prompt = build_system_prompt(request.native_language, request.target_language)

    # Step 1: If user explicitly asks for news, search proactively
    if _is_news_request(request.message):
        raw = await search_news(request.message, max_results=5)
        articles = [ChatNewsArticle(**a) for a in raw]
        if articles:
            summaries = "\n".join(f"- {a.title} ({a.source}): {a.body[:150]}" for a in articles)
            system_prompt += (
                f"\n\n[NEWS RESULTS]\n{summaries}\n\n"
                f"Discuss these news articles naturally in {request.target_language}. "
                f"Still correct any language errors."
            )

    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    # Step 2: First LLM call
    response_text = await _call_llm(messages)

    parsed = None
    try:
        parsed = _parse_json_response(response_text)
    except (json.JSONDecodeError, KeyError, TypeError):
        pass

    # Step 3: If LLM can't answer, search the web and retry
    if not articles and _needs_web_search(response_text, parsed):
        raw = await search_web(request.message, max_results=5)
        articles = [ChatNewsArticle(**a) for a in raw]

        if articles:
            summaries = "\n".join(f"- {a.title} ({a.source}): {a.body[:200]}" for a in articles)
            web_context = (
                f"\n\n[WEB SEARCH RESULTS for \"{request.message}\"]\n{summaries}\n\n"
                f"Use these web results to answer the user's question in {request.target_language}. "
                f"Be helpful and informative. Still correct any language errors."
            )
            # Rebuild messages with web context
            messages[0] = {"role": "system", "content": system_prompt + web_context}
            response_text = await _call_llm(messages)

            try:
                parsed = _parse_json_response(response_text)
            except (json.JSONDecodeError, KeyError, TypeError):
                parsed = None

    # Step 4: Build response
    if parsed:
        return ChatResponse(
            reply=parsed.get("reply", response_text),
            corrections=parsed.get("corrections", []),
            translated_reply=parsed.get("translated_reply", ""),
            news_articles=[a.model_dump() for a in articles],
        )
    else:
        return ChatResponse(
            reply=response_text,
            corrections=[],
            translated_reply="",
            news_articles=[a.model_dump() for a in articles],
        )


async def translate_text(request: TranslateRequest) -> TranslateResponse:
    messages = [
        {
            "role": "system",
            "content": f"""You are a translator and grammar checker. The user will provide text in {request.from_language}.

Your job:
1. Check the input text for any grammar, spelling, or syntax errors in {request.from_language}.
2. Translate the text from {request.from_language} to {request.to_language}.

You MUST respond with valid JSON in this exact format (no markdown, no code fences):
{{
  "translated_text": "the translation in {request.to_language}",
  "corrected_text": "the corrected version of the input in {request.from_language} (same as input if no errors)",
  "corrections": [
    {{
      "original": "the incorrect part",
      "corrected": "the correct form",
      "explanation": "brief explanation of the error in {request.to_language}"
    }}
  ]
}}

If there are no errors, return an empty corrections array and set corrected_text to the original input.""",
        },
        {"role": "user", "content": request.text},
    ]

    response_text = await _call_llm(messages)

    try:
        data = _parse_json_response(response_text)
        return TranslateResponse(
            translated_text=data.get("translated_text", ""),
            original_text=request.text,
            corrected_text=data.get("corrected_text", ""),
            corrections=[TranslateCorrection(**c) for c in data.get("corrections", [])],
        )
    except (json.JSONDecodeError, KeyError, TypeError):
        return TranslateResponse(
            translated_text=response_text.strip(),
            original_text=request.text,
        )
