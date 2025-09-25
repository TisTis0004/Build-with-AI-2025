import os
from dotenv import load_dotenv
from google import genai

# Load .env file so GEMINI_API_KEY becomes available
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing. Did you set it in .env?")

# Pass the key explicitly (works even if env is set)
client = genai.Client(api_key=GEMINI_API_KEY)

def _add(bullets, line):
    if line:
        bullets.append(f"- {line}")

def generate_accessible_text(text: str, disability_type: str, options: dict | None = None) -> str:
    """
    Accepts:
      text: highlighted / extracted text (string)
      disability_type: "dyslexia" | "adhd" | "aphasia" | "autism"
      options: checkbox flags ONLY (booleans). Example:
        ADHD:   {"chunking": true, "bulletSummary": true}
        Aphasia:{"simplify": true, "shortSentences": true}
        Autism: {"idiomSimplification": true, "useEmojis": true}
        Dyslexia: {"fontMode": true}  # visual; still can influence prompt wording
    Returns: model's adapted text (string)
    """
    opts = options or {}
    dt = (disability_type or "").strip().lower()

    # Base instruction
    lines = [
        "Rewrite the following text to improve accessibility for the specified profile.",
        "IMMEDIATELY start with the adapted text; do not add an introduction or disclaimers.",
    ]

    # Per-profile guidance (aligning with extension checkbox keys)
    if dt == "dyslexia":
        _add(lines, "Use clear, concise wording and avoid complex clause chains.")
        if opts.get("fontMode"):
            _add(lines, "Optimize for readability (short paragraphs, generous spacing cues).")

    elif dt == "adhd":
        _add(lines, "Make the text scannable and easy to follow.")
        if opts.get("chunking"):
            _add(lines, "Chunk content into short paragraphs/sections with clear sub-ideas.")
        if opts.get("bulletSummary"):
            _add(lines, "Include a brief bullet summary of key points at the end.")

    elif dt == "aphasia":
        _add(lines, "Use simple vocabulary and straightforward sentence structure.")
        if opts.get("simplify"):
            _add(lines, "Prefer common words; replace complex terms with simpler alternatives.")
        if opts.get("shortSentences"):
            _add(lines, "Use short sentences; keep each sentence to one idea.")

    elif dt == "autism":
        _add(lines, "Make the text direct, explicit, and literal where possible.")
        if opts.get("idiomSimplification"):
            _add(lines, "Detect idioms/figurative language and rewrite them with literal meaning.")
        if opts.get("useEmojis"):
            _add(lines, "Optionally add light, clarifying emojis where helpful (do not overuse).")

    else:
        # Fallback generic simplification
        _add(lines, "Simplify and clarify while preserving meaning.")

    # Build prompt
    prompt = (
        "\n".join(lines)
        + "\n\n"
        + "Original text:\n"
        + text
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text
