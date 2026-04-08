from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from transformers import pipeline

# FastAPI 앱 생성
app = FastAPI(
    title="Sentiment Analysis API",
    description="간단한 텍스트 감정 분석(긍정/부정) API 서버",
    version="1.0.0"
)

# 감정 분석 모델 로드 (앱 시작 시 한 번만 로드하여 메모리에 적재)
# 처음 실행 시 Hugging Face 모델(distilbert-base-uncased-finetuned-sst-2-english)이 다운로드 됩니다.
classifier = pipeline("sentiment-analysis")

# 요청(Request) 데이터 스키마 정의
class SentimentRequest(BaseModel):
    text: str

# 응답(Response) 데이터 스키마 정의
class SentimentResponse(BaseModel):
    label: str
    score: float

@app.get("/")
def read_root():
    # 루트 경로 접속 시 우리가 만든 메인 UI HTML 파일을 반환합니다.
    return FileResponse("app/static/index.html")

@app.get("/style.css")
def get_style():
    return FileResponse("app/static/style.css")

@app.get("/script.js")
def get_script():
    return FileResponse("app/static/script.js")

@app.post("/analyze", response_model=SentimentResponse)
def analyze_text(request: SentimentRequest):
    """
    텍스트를 입력받아 감정(긍정/부정)을 분석하여 반환합니다.
    """
    # 파이프라인을 통한 추론 수행
    result = classifier(request.text)[0]
    
    return SentimentResponse(
        label=result['label'],
        score=result['score']
    )
