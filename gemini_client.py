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
        "Also, use the same language as the original text, do not translate to English",
    ]

    # Per-profile guidance (aligning with extension checkbox keys)
    if dt == "dyslexia":
        _add(lines, "This text should be read by someone with Dyslexia, make it easy to read for them. Use clear, concise wording and avoid complex clause chains.")
        if opts.get("fontMode"):
            _add(lines, "Optimize for readability (short paragraphs, generous spacing cues).")

    elif dt == "adhd":
        _add(lines, "This text should be read by someone with ADHD, make it easy to read for them.")
        if opts.get("chunking"):
            _add(lines, "Take the original long text, and break it down into small chunks or paragraphs or sentences, so you make them easy to read for ADHD people.")
        if opts.get("bulletSummary"):
            _add(lines, "At the end, write a brief bullet summary of key points.")

    elif dt == "aphasia":
        _add(lines, "This text should be read by someone with Aphasia, make it easy to read for them.")
        if opts.get("simplify"):
            _add(lines, "The user wants you to use common words; replace complex terms with simpler alternatives.")
        if opts.get("shortSentences"):
            _add(lines, "The user wants you to use short sentences; keep each sentence to one idea.")

    elif dt == "autism":
        _add(lines, "This text should be read by someone with Autism, make it easy to read for them. Make the text direct, explicit, and literal where possible.")
        if opts.get("idiomSimplification"):
            _add(lines, "The user want you to detect idioms/figurative language (which isn't easy to understand for them) and rewrite them with literal meaning.")
        if opts.get("useEmojis"):
            _add(lines, "The user want you to add light, clarifying emojis where helpful (do not overuse).")

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
