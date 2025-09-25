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
        _add(lines, "This text should be read by someone with ADHD. Make it easy to scan and process. Be concise and concrete.")
        if opts.get("chunking", True):
            _add(lines, "Split the content into SMALL, titled chunks. Each chunk is 1–2 short, direct sentences—one idea per sentence.")
        # ✨ add light emoji cues (at most 1 per title)
        if opts.get("useEmojis", True):
            _add(lines, "Add one light, relevant emoji to each CHUNK TITLE (max 1 emoji per title). Do not overuse.")
        if opts.get("bulletSummary", True):
            _add(lines, "After the chunks, include a 'Key Points' section as concise bullets (3–6 items, ≤ 15 words each). Put TWO line breaks after each bullet so each appears on its own line.")

        # Section breaks for visual breathing room
        _add(lines, "Insert '---' as a horizontal break between major sections.")

        # 🔶 Highlight block markers for the summary (frontend will style)
        _add(lines, "Wrap the 'Key Points' bullets between lines that say exactly '::: highlight' and ':::' (on their own lines). Example:\n::: highlight\n- Bullet 1\n\n- Bullet 2\n:::")

        # Keep output predictable
        lines += [
            "OUTPUT RULES (MANDATORY):",
            "Use the SAME language as the original.",
            "Start directly with adapted content (no preface).",
            "Do NOT add explanations about what you did.",
        ]


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
