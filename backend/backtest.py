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


def _compute_combined(rsi_val, price, bb_upper, bb_lower, ema9, ema21, prev_ema9, prev_ema21) -> str:
    buy = 0
    sell = 0
    if rsi_val < 30:
        buy += 1
    elif rsi_val > 70:
        sell += 1
    if price <= bb_lower:
        buy += 1
    elif price >= bb_upper:
        sell += 1
    if prev_ema9 < prev_ema21 and ema9 > ema21:
        buy += 1
    elif prev_ema9 > prev_ema21 and ema9 < ema21:
        sell += 1
    if buy >= 2:
        return "BUY"
    if sell >= 2:
        return "SELL"
    return "NEUTRAL"


def run_backtest(ticker: str) -> dict:
    df = yf.download(ticker, period="2y", interval="1d", progress=False)
    if df.empty or len(df) < 60:
        raise ValueError(f"Not enough data for {ticker}.")

    # Handle MultiIndex columns from newer yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    close = df["Close"].squeeze()
    rsi = _rsi(close)
    _, bb_upper, bb_lower = _bollinger(close)
    ema9 = _ema(close, 9)
    ema21 = _ema(close, 21)

    # Strategy simulation
    capital = 10000.0
    bh_capital = 10000.0
    position = 0.0  # shares held
    in_trade = False
    entry_price = 0.0
    trades = []
    equity_curve = []
    bh_curve = []
    bh_shares = 10000.0 / float(close.iloc[21])

    wins = 0
    losses = 0

    for i in range(22, len(close)):
        price = float(close.iloc[i])
        r = float(rsi.iloc[i])
        bbu = float(bb_upper.iloc[i])
        bbl = float(bb_lower.iloc[i])
        e9 = float(ema9.iloc[i])
        e21 = float(ema21.iloc[i])
        pe9 = float(ema9.iloc[i - 1])
        pe21 = float(ema21.iloc[i - 1])

        sig = _compute_combined(r, price, bbu, bbl, e9, e21, pe9, pe21)

        if not in_trade and sig == "BUY":
            position = capital / price
            entry_price = price
            in_trade = True
        elif in_trade and sig == "SELL":
            pnl = (price - entry_price) / entry_price
            capital = position * price
            position = 0
            in_trade = False
            if pnl > 0:
                wins += 1
            else:
                losses += 1
            trades.append({
                "date": str(close.index[i].date()),
                "type": "EXIT",
                "price": round(price, 2),
                "pnl_pct": round(pnl * 100, 2),
            })

        current_value = capital + position * price
        bh_value = bh_shares * price

        date_str = str(close.index[i].date())
        equity_curve.append({"date": date_str, "value": round(current_value, 2)})
        bh_curve.append({"date": date_str, "value": round(bh_value, 2)})

    # Close open position at last price
    if in_trade:
        last_price = float(close.iloc[-1])
        capital = position * last_price

    final_value = capital
    bh_final = bh_shares * float(close.iloc[-1])
    total_return = (final_value - 10000) / 10000 * 100
    bh_return = (bh_final - 10000) / 10000 * 100

    # Sharpe ratio (annualized, using daily returns from equity curve)
    values = np.array([e["value"] for e in equity_curve])
    daily_returns = np.diff(values) / values[:-1]
    sharpe = (np.mean(daily_returns) / np.std(daily_returns) * np.sqrt(252)) if np.std(daily_returns) > 0 else 0.0

    # Max drawdown
    peak = values[0]
    max_dd = 0.0
    for v in values:
        if v > peak:
            peak = v
        dd = (peak - v) / peak
        if dd > max_dd:
            max_dd = dd

    total_trades = wins + losses
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0.0

    return {
        "ticker": ticker,
        "total_return_pct": round(total_return, 2),
        "bh_return_pct": round(bh_return, 2),
        "sharpe_ratio": round(sharpe, 2),
        "max_drawdown_pct": round(max_dd * 100, 2),
        "win_rate_pct": round(win_rate, 1),
        "total_trades": total_trades,
        "wins": wins,
        "losses": losses,
        "equity_curve": equity_curve[::3],   # downsample for payload size
        "bh_curve": bh_curve[::3],
        "recent_trades": trades[-20:],
    }
