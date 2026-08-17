import yfinance as yf

from app.services.technical_indicators import (
    calculate_indicators,
)


def calculate_technical_signal(
    ticker: str
):

    stock = yf.Ticker(ticker)

    history = stock.history(
        period="1y",
        interval="1d"
    )

    if history.empty:
        raise ValueError(
            f"No historical data found for {ticker}"
        )

    # -----------------------------------------
    # Calculate indicators
    # -----------------------------------------

    df = calculate_indicators(
        history
    )

    latest = df.iloc[-1]

    # -----------------------------------------
    # Extract values
    # -----------------------------------------

    price = float(
        latest["Close"]
    )

    sma20 = latest["sma20"]

    sma50 = latest["sma50"]

    ema20 = latest["ema20"]

    ema50 = latest["ema50"]

    rsi = latest["rsi"]

    macd = latest["macd"]

    macd_signal = (
        latest["macdSignal"]
    )

    # -----------------------------------------
    # Signal scoring
    # -----------------------------------------

    score = 0

    reasons = []

    # -----------------------------------------
    # Price vs SMA20
    # -----------------------------------------

    if pd_notna(price, sma20):

        if price > sma20:

            score += 1

            reasons.append(
                "Price is above the 20-day SMA"
            )

        else:

            score -= 1

            reasons.append(
                "Price is below the 20-day SMA"
            )

    # -----------------------------------------
    # SMA20 vs SMA50
    # -----------------------------------------

    if pd_notna(sma20, sma50):

        if sma20 > sma50:

            score += 2

            reasons.append(
                "20-day SMA is above 50-day SMA"
            )

        else:

            score -= 2

            reasons.append(
                "20-day SMA is below 50-day SMA"
            )

    # -----------------------------------------
    # EMA20 vs EMA50
    # -----------------------------------------

    if pd_notna(ema20, ema50):

        if ema20 > ema50:

            score += 1

            reasons.append(
                "20-day EMA is above 50-day EMA"
            )

        else:

            score -= 1

            reasons.append(
                "20-day EMA is below 50-day EMA"
            )

    # -----------------------------------------
    # RSI
    # -----------------------------------------

    if pd_notna(rsi):

        if rsi < 30:

            score += 2

            reasons.append(
                "RSI indicates potentially oversold conditions"
            )

        elif rsi > 70:

            score -= 2

            reasons.append(
                "RSI indicates potentially overbought conditions"
            )

        elif rsi >= 50:

            score += 1

            reasons.append(
                "RSI is above 50"
            )

        else:

            score -= 1

            reasons.append(
                "RSI is below 50"
            )

    # -----------------------------------------
    # MACD
    # -----------------------------------------

    if pd_notna(
        macd,
        macd_signal
    ):

        if macd > macd_signal:

            score += 2

            reasons.append(
                "MACD is above its signal line"
            )

        else:

            score -= 2

            reasons.append(
                "MACD is below its signal line"
            )

    # -----------------------------------------
    # Final signal
    # -----------------------------------------

    if score >= 3:

        signal = "BUY"

    elif score <= -3:

        signal = "SELL"

    else:

        signal = "HOLD"

    # -----------------------------------------
    # Confidence
    # -----------------------------------------

    confidence = min(
        abs(score) / 8,
        1
    )

    return {
        "ticker": ticker.upper(),

        "signal": signal,

        "score": score,

        "confidence": round(
            confidence,
            2
        ),

        "price": price,

        "sma20": safe_float(
            sma20
        ),

        "sma50": safe_float(
            sma50
        ),

        "ema20": safe_float(
            ema20
        ),

        "ema50": safe_float(
            ema50
        ),

        "rsi": safe_float(
            rsi
        ),

        "macd": safe_float(
            macd
        ),

        "macdSignal": safe_float(
            macd_signal
        ),

        "reasons": reasons,
    }


def pd_notna(*values):

    return all(
        value is not None
        and not (
            hasattr(
                value,
                "isna"
            )
            and value.isna()
        )
        for value in values
    )


def safe_float(value):

    if value is None:
        return None

    try:

        if hasattr(
            value,
            "isna"
        ) and value.isna():

            return None

        return round(
            float(value),
            2
        )

    except (
        TypeError,
        ValueError
    ):

        return None