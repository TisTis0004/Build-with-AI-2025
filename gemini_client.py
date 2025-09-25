import os
from dotenv import load_dotenv
from google import genai


# Load .env file so GEMINI_API_KEY becomes available
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Did you set it in .env?")

client = genai.Client()


def generate_accessible_text(text: str, disability_type: str) -> str:
    """
    Takes input text and disability type.
    For now, only 'dyslexia' is supported.
    Returns Gemini's simplified output.
    """
    if disability_type.lower() == "dyslexia":
        prompt = (
            "Rewrite the following text so it is easier for people with dyslexia to read.\n"
            "- IMMEDIATLY start with the text, don't write any introductions.\n\n"
            f"Original text:\n{text}"
        )
    elif disability_type.lower() == "adhd":
        prompt = f"Rewrite this text for better accessibility ({disability_type}):\n{text}"

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text

if __name__ == "__main__":
    sample = """
Palestinian President Mahmoud Abbas is set to address the United Nations General Assembly virtually on Thursday, at a time when questions loom over whether Washington will move to prevent 'Israel' from formally annexing parts of the occupied West Bank.

Abbas, 89, will deliver his remarks just days after France hosted a high-profile summit in which several European nations extended recognition to the State of Palestine. His participation comes despite long-standing US opposition to his leadership. The Trump administration, in a rare diplomatic step, barred him and senior aides from traveling to New York for the annual gathering of world leaders.

Instead, the General Assembly voted overwhelmingly to allow him to send a video message.

Meanwhile, 'Israeli' Prime Minister Benjamin Netanyahu is scheduled to deliver his own address to the General Assembly on Friday.

Netanyahu has repeatedly ruled out the establishment of a Palestinian state, while far-right members of his coalition have urged annexation of West Bank territories, a move critics say would close the door on any path toward independence.

French President Emmanuel Macron, who has clashed with Washington over Palestinian statehood, revealed that US President Donald Trump nonetheless aligned with him in opposing annexation. “What President Trump told me yesterday was that the Europeans and Americans have the same position,” Macron said in a joint interview with France 24 and Radio France Internationale.

At the same time, Trump’s personal friend-turned-envoy Steve Witkoff announced that the White House had presented a 21-point proposal to Arab and Islamic leaders aimed at ending the conflict.

“I think it addresses Israeli concerns as well as the concerns of all the neighbors in the region,” he told the Concordia summit held alongside the UN gathering. “We’re hopeful, and I might say even confident, that in the coming days we’ll be able to announce some sort of breakthrough.”

A senior US official confirmed to Agence France-Presse (AFP) that Trump is eager to bring the fighting to a swift end and that regional leaders signaled willingness to engage with the plan through Witkoff’s mediation.

According to Macron, Washington’s proposal reflects aspects of a French blueprint that calls for Hamas to disarm and for an international stabilization force to be deployed. A French policy document reviewed by AFP outlines a phased transfer of security responsibilities in Gaza to a restructured Palestinian Authority once a ceasefire takes hold.

Indonesian President Prabowo Subianto, who met with Trump during the discussions, indicated that his country was ready to contribute at least 20,000 troops if such a plan materializes.
""".strip()
    
    result = generate_accessible_text(sample, "dyslexia")
    print("---- Simplified ----")
    print(result)

