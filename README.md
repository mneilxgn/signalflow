# SignalFlow

Institutional momentum and mean-reversion signals for retail investors.

## Stack
- **Backend**: Python + FastAPI + yfinance
- **Frontend**: React + Tailwind CSS + Recharts

## Signals
- RSI (14-period) — oversold/overbought detection
- Bollinger Bands (20-period, 2σ) — mean-reversion entries
- EMA Crossover (9/21) — momentum entries
- Combined BUY / SELL / NEUTRAL with confidence score

## Running locally

```bash
bash start.sh
```

Opens at http://localhost:5173. Backend API at http://localhost:8000.

### Manual setup

**Backend**
```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
venv/bin/uvicorn main:app --port 8000 --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
