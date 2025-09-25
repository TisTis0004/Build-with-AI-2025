from pydantic import BaseModel
from typing import Optional
class GenerateRequest(BaseModel):
    text: str
    type: str  
class  GenerateResponse(BaseModel):
    output_text: str