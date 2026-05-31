import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from signals import compute_signals
from backtest import run_backtest
from mangum import Mangum

app = FastAPI(title="SignalFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/signals/{ticker}")
def get_signals(ticker: str):
    ticker = ticker.upper().strip()
    try:
        return compute_signals(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")


@app.get("/api/backtest/{ticker}")
def get_backtest(ticker: str):
    ticker = ticker.upper().strip()
    try:
        return run_backtest(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")


handler = Mangum(app, lifespan="off")
