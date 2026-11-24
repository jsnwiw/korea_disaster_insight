# NDVM Backend

## Setup (Windows PowerShell)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# .env 파일에 KMA_SERVICE_KEY를 직접 입력
python -m uvicorn app.main:app --reload --port 8000
```

API 문서: http://127.0.0.1:8000/docs

## API
- `GET /api/health`: 키/WMS 설정 상태
- `GET /api/weather/daily-rain?stn_id=119&start_date=2026-10-01&end_date=2026-10-07`: 기상청 ASOS 관측 자료
- `GET /api/flood/map-config`: WMS 설정

## Important
- 과거 피해 CSV가 필요한 레거시 통계/점수 엔드포인트는 공식 피해 데이터 API로 교체되기 전까지 CSV 없이 실제 결과를 반환하지 않습니다.
- WMS 주소와 레이어명은 한강홍수통제소 서비스 안내에서 확인한 실제 값을 사용해야 합니다.
- `.env`에는 개인 인증키를 저장하고 공개 저장소/공유 ZIP에 포함하지 마세요.
