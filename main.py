# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import GenerateRequest, GenerateResponse
from gemini_client import generate_accessible_text

app = FastAPI(title="NeuroRead LLM Adapter", version="1.0.0")

# Allow calls from your extension/background (and localhost dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev; lock this down later if desired
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transform", response_model=GenerateResponse)
async def transform(req: GenerateRequest) -> GenerateResponse:
    try:
        output = generate_accessible_text(
            text=req.text,
            disability_type=req.disability_type,
            options=req.options or {},
        )
        return GenerateResponse(text=output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model call failed: {e}")

@app.get("/health")
def health():
    return {"status": "OK"}
