import yfinance as yf
import pandas as pd
import numpy as np


def _rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def _bollinger(close: pd.Series, period: int = 20, std_dev: float = 2.0):
    ma = close.rolling(period).mean()
    std = close.rolling(period).std()
    return ma, ma + std_dev * std, ma - std_dev * std


def _ema(close: pd.Series, span: int) -> pd.Series:
    return close.ewm(span=span, adjust=False).mean()


def compute_signals(ticker: str) -> dict:
    df = yf.download(ticker, period="3mo", interval="1d", progress=False)
    if df.empty or len(df) < 30:
        raise ValueError(f"Not enough data for {ticker}. Check the ticker symbol.")

    # Handle MultiIndex columns from newer yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    close = df["Close"].squeeze()

    rsi = _rsi(close)
    bb_mid, bb_upper, bb_lower = _bollinger(close)
    ema9 = _ema(close, 9)
    ema21 = _ema(close, 21)

    last_rsi = float(rsi.iloc[-1])
    last_price = float(close.iloc[-1])
    last_bb_upper = float(bb_upper.iloc[-1])
    last_bb_lower = float(bb_lower.iloc[-1])
    last_bb_mid = float(bb_mid.iloc[-1])
    last_ema9 = float(ema9.iloc[-1])
    last_ema21 = float(ema21.iloc[-1])

    # Previous day for crossover detection
    prev_ema9 = float(ema9.iloc[-2])
    prev_ema21 = float(ema21.iloc[-2])

    signals = []
    reasons = []
    buy_votes = 0
    sell_votes = 0

    # RSI signal
    if last_rsi < 30:
        signals.append("BUY")
        buy_votes += 1
        reasons.append(f"RSI is oversold at {last_rsi:.1f} (below 30), suggesting the stock may be undervalued")
    elif last_rsi > 70:
        signals.append("SELL")
        sell_votes += 1
        reasons.append(f"RSI is overbought at {last_rsi:.1f} (above 70), suggesting the stock may be overvalued")
    else:
        signals.append("NEUTRAL")
        reasons.append(f"RSI is neutral at {last_rsi:.1f} (between 30–70)")

    # Bollinger Band signal
    bb_pct = (last_price - last_bb_lower) / (last_bb_upper - last_bb_lower) if (last_bb_upper - last_bb_lower) > 0 else 0.5
    if last_price <= last_bb_lower:
        signals.append("BUY")
        buy_votes += 1
        reasons.append(f"Price (${last_price:.2f}) touched the lower Bollinger Band (${last_bb_lower:.2f}), a mean-reversion buy signal")
    elif last_price >= last_bb_upper:
        signals.append("SELL")
        sell_votes += 1
        reasons.append(f"Price (${last_price:.2f}) touched the upper Bollinger Band (${last_bb_upper:.2f}), a mean-reversion sell signal")
    else:
        signals.append("NEUTRAL")
        reasons.append(f"Price (${last_price:.2f}) is within Bollinger Bands (${last_bb_lower:.2f}–${last_bb_upper:.2f})")

    # EMA crossover signal
    bullish_cross = prev_ema9 < prev_ema21 and last_ema9 > last_ema21
    bearish_cross = prev_ema9 > prev_ema21 and last_ema9 < last_ema21

    if bullish_cross:
        signals.append("BUY")
        buy_votes += 1
        reasons.append(f"9-EMA (${last_ema9:.2f}) crossed above 21-EMA (${last_ema21:.2f}) — bullish momentum crossover")
    elif bearish_cross:
        signals.append("SELL")
        sell_votes += 1
        reasons.append(f"9-EMA (${last_ema9:.2f}) crossed below 21-EMA (${last_ema21:.2f}) — bearish momentum crossover")
    elif last_ema9 > last_ema21:
        signals.append("NEUTRAL")
        reasons.append(f"9-EMA (${last_ema9:.2f}) is above 21-EMA (${last_ema21:.2f}) — uptrend in place, no fresh crossover")
    else:
        signals.append("NEUTRAL")
        reasons.append(f"9-EMA (${last_ema9:.2f}) is below 21-EMA (${last_ema21:.2f}) — downtrend in place, no fresh crossover")

    # Combined signal
    total = 3
    if buy_votes > sell_votes and buy_votes >= 2:
        combined = "BUY"
        confidence = int((buy_votes / total) * 100)
    elif sell_votes > buy_votes and sell_votes >= 2:
        combined = "SELL"
        confidence = int((sell_votes / total) * 100)
    elif buy_votes > sell_votes:
        combined = "BUY"
        confidence = int((buy_votes / total) * 60)
    elif sell_votes > buy_votes:
        combined = "SELL"
        confidence = int((sell_votes / total) * 60)
    else:
        combined = "NEUTRAL"
        confidence = 33

    # Build signal history from last 30 rows
    history = []
    for i in range(max(1, len(close) - 30), len(close) - 1):
        h_rsi = float(rsi.iloc[i])
        h_price = float(close.iloc[i])
        h_bb_upper = float(bb_upper.iloc[i])
        h_bb_lower = float(bb_lower.iloc[i])
        h_ema9 = float(ema9.iloc[i])
        h_ema21 = float(ema21.iloc[i])
        p_ema9 = float(ema9.iloc[i - 1])
        p_ema21 = float(ema21.iloc[i - 1])

        h_buy = 0
        h_sell = 0
        if h_rsi < 30:
            h_buy += 1
        elif h_rsi > 70:
            h_sell += 1
        if h_price <= h_bb_lower:
            h_buy += 1
        elif h_price >= h_bb_upper:
            h_sell += 1
        if p_ema9 < p_ema21 and h_ema9 > h_ema21:
            h_buy += 1
        elif p_ema9 > p_ema21 and h_ema9 < h_ema21:
            h_sell += 1

        if h_buy >= 2:
            h_signal = "BUY"
        elif h_sell >= 2:
            h_signal = "SELL"
        else:
            h_signal = "NEUTRAL"

        future_idx = i + 1
        future_price = float(close.iloc[future_idx]) if future_idx < len(close) else h_price
        pnl_pct = ((future_price - h_price) / h_price) * 100
        profitable = None
        if h_signal == "BUY":
            profitable = pnl_pct > 0
        elif h_signal == "SELL":
            profitable = pnl_pct < 0

        date_val = close.index[i]
        history.append({
            "date": str(date_val.date()) if hasattr(date_val, 'date') else str(date_val)[:10],
            "price": round(h_price, 2),
            "signal": h_signal,
            "rsi": round(h_rsi, 1),
            "next_day_pct": round(pnl_pct, 2),
            "profitable": profitable,
        })

    # Chart data: last 60 days of price + indicators
    chart_dates = [str(d.date()) if hasattr(d, 'date') else str(d)[:10] for d in close.index[-60:]]
    chart_close = [round(float(v), 2) for v in close.iloc[-60:]]
    chart_bb_upper = [round(float(v), 2) if not np.isnan(v) else None for v in bb_upper.iloc[-60:]]
    chart_bb_lower = [round(float(v), 2) if not np.isnan(v) else None for v in bb_lower.iloc[-60:]]
    chart_bb_mid = [round(float(v), 2) if not np.isnan(v) else None for v in bb_mid.iloc[-60:]]
    chart_ema9 = [round(float(v), 2) if not np.isnan(v) else None for v in ema9.iloc[-60:]]
    chart_ema21 = [round(float(v), 2) if not np.isnan(v) else None for v in ema21.iloc[-60:]]

    return {
        "ticker": ticker,
        "price": round(last_price, 2),
        "signal": combined,
        "confidence": confidence,
        "reasons": reasons,
        "indicators": {
            "rsi": round(last_rsi, 1),
            "bb_upper": round(last_bb_upper, 2),
            "bb_lower": round(last_bb_lower, 2),
            "bb_mid": round(last_bb_mid, 2),
            "bb_pct": round(bb_pct * 100, 1),
            "ema9": round(last_ema9, 2),
            "ema21": round(last_ema21, 2),
        },
        "individual_signals": {
            "rsi": signals[0],
            "bollinger": signals[1],
            "ema": signals[2],
        },
        "chart": {
            "dates": chart_dates,
            "close": chart_close,
            "bb_upper": chart_bb_upper,
            "bb_lower": chart_bb_lower,
            "bb_mid": chart_bb_mid,
            "ema9": chart_ema9,
            "ema21": chart_ema21,
        },
        "history": history,
    }
