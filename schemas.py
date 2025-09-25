from typing import Optional, Dict
from pydantic import BaseModel

class GenerateRequest(BaseModel):
    text: str
    disability_type: str                 # e.g., "dyslexia" | "adhd" | "aphasia" | "autism"
    options: Optional[Dict[str, bool]] = None  # checkbox flags only, e.g., {"idiomSimplification": true}

class GenerateResponse(BaseModel):
    text: str                             # plain text output (what the extension expects)
