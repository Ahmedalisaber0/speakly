import io
import edge_tts


async def get_voices(language_code: str = "") -> list[dict]:
    """Get available voices, optionally filtered by language code prefix."""
    all_voices = await edge_tts.list_voices()
    if language_code:
        all_voices = [v for v in all_voices if v["Locale"].startswith(language_code)]
    return [
        {
            "id": v["ShortName"],
            "name": v["FriendlyName"],
            "locale": v["Locale"],
            "gender": v["Gender"],
        }
        for v in all_voices
    ]


async def synthesize_speech(text: str, voice: str = "en-US-AriaNeural") -> bytes:
    """Convert text to speech and return MP3 bytes."""
    communicate = edge_tts.Communicate(text, voice)
    buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])
    return buffer.getvalue()
