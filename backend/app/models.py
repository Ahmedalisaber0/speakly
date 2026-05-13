from pydantic import BaseModel


class MessageItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    native_language: str
    target_language: str
    conversation_history: list[MessageItem] = []
    # Set by an authed client to continue an existing conversation. None means
    # "start a new one" — the server will create a Conversation row and return
    # its id in the response so the client can keep using it.
    conversation_id: int | None = None


class Correction(BaseModel):
    original: str
    corrected: str
    explanation: str


class ChatNewsArticle(BaseModel):
    title: str
    url: str
    body: str
    source: str
    image: str = ""
    date: str = ""


class ChatResponse(BaseModel):
    reply: str
    corrections: list[Correction] = []
    translated_reply: str = ""
    news_articles: list[ChatNewsArticle] = []
    needs_clarification: bool = False
    suggested_correction: str = ""
    correction_language: str = ""
    # Echoed back so the client can latch onto the right conversation when it
    # was newly created (request had conversation_id=None).
    conversation_id: int | None = None


class TranslateRequest(BaseModel):
    text: str
    from_language: str
    to_language: str


class TranslateCorrection(BaseModel):
    original: str
    corrected: str
    explanation: str


class TranslateResponse(BaseModel):
    translated_text: str
    original_text: str
    corrected_text: str = ""
    corrections: list[TranslateCorrection] = []


class NewsArticle(BaseModel):
    title: str
    url: str
    body: str
    source: str
    image: str = ""
    date: str = ""


class NewsResponse(BaseModel):
    articles: list[NewsArticle]
    query: str


class NewsTranslateRequest(BaseModel):
    title: str
    body: str = ""
    target_language: str


class NewsTranslateResponse(BaseModel):
    translated_title: str
    summary: str


class NewsArticleInput(BaseModel):
    title: str
    body: str = ""


class NewsTranslateBatchRequest(BaseModel):
    articles: list[NewsArticleInput]
    target_language: str


class NewsTranslateBatchResponse(BaseModel):
    translations: list[NewsTranslateResponse]


class GrammarCheckRequest(BaseModel):
    text: str
    language: str


class GrammarCheckResponse(BaseModel):
    original: str
    corrected: str
    corrections: list[Correction] = []
