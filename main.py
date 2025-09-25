# main.py
from fastapi import FastAPI, HTTPException
from schemas import GenerateRequest, GenerateResponse
from gemini_client import generate_accessible_text
app = FastAPI(title="LLM Backend (Adapter)", version="1.0.0")

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest) -> GenerateResponse:
    try:
        # DO NOT await a sync function
        output = generate_accessible_text(req.text, req.type)
        return GenerateResponse(output_text=output)
    except Exception as e:
        # surface the error cleanly
        raise HTTPException(status_code=500, detail=f"Model call failed: {e}")

@app.get("/health")
def health():
    return {"status": "OK"}
