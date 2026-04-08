# 파이썬 3.10 슬림 이미지를 베이스로 사용 (이미지 크기를 줄이기 위함)
FROM python:3.10-slim

# 파이썬 환경 변수 설정
# PYTHONDONTWRITEBYTECODE: 파이썬이 .pyc 파일을 쓰지 않도록 설정
# PYTHONUNBUFFERED: 파이썬 출력이 버퍼링 없이 즉시 터미널에 찍히도록 설정 (로그 확인 용이)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Hugging Face 모델 캐시 디렉토리 설정
ENV HF_HOME=/app/cache

# 컨테이너 내 작업 디렉토리 설정
WORKDIR /app

# 시스템 필수 패키지 설치 및 정리 (필요에 따라 최소화)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 패키지 설치 리스트 복사 (소스코드보다 먼저 복사하여 레이어 캐싱 활용)
# 코드를 수정해도 requirements가 변하지 않으면 재설치하지 않음
COPY requirements.txt .

# [최적화 1] PyTorch를 컨테이너용으로 가볍게(CPU 전용) 설치 후 나머지 패키지 설치
# (기본 pip install torch는 GPU용 바이너리까지 받아 이미지 크기가 GB 단위로 매우 커집니다)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# [최적화 2] 런타임 콜드스타트 방지를 위해 모델 가중치를 '빌드 과정'에서 미리 다운로드
RUN python -c "from transformers import pipeline; pipeline('text-classification', model='j-hartmann/emotion-english-distilroberta-base')"

# 애플리케이션 코드 복사
COPY ./app ./app

# API 서버가 사용할 포트 개방
EXPOSE 8000

# 서버 실행 명령어
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
