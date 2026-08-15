from typing import Optional


def calculate_ema(
    values: list[float],
    period: int,
) -> Optional[float]:

    if len(values) < period:
        return None

    # Initial SMA
    ema = sum(values[:period]) / period

    multiplier = 2 / (period + 1)

    for price in values[period:]:
        ema = (price - ema) * multiplier + ema

    return ema


def calculate_rsi(
    values: list[float],
    period: int = 14,
) -> Optional[float]:

    if len(values) <= period:
        return None

    gains = []
    losses = []

    for i in range(1, len(values)):
        change = values[i] - values[i - 1]

        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))

    average_gain = sum(gains[:period]) / period
    average_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        average_gain = (
            average_gain * (period - 1)
            + gains[i]
        ) / period

        average_loss = (
            average_loss * (period - 1)
            + losses[i]
        ) / period

    if average_loss == 0:
        return 100.0

    relative_strength = (
        average_gain / average_loss
    )

    rsi = 100 - (
        100 / (1 + relative_strength)
    )

    return rsi


def calculate_macd(
    values: list[float],
):
    ema12 = calculate_ema(values, 12)
    ema26 = calculate_ema(values, 26)

    if ema12 is None or ema26 is None:
        return {
            "macd": None,
            "signal": None,
            "histogram": None,
        }

    macd = ema12 - ema26

    # Beta implementation
    signal = macd

    histogram = macd - signal

    return {
        "macd": macd,
        "signal": signal,
        "histogram": histogram,
    }


def calculate_technical_signal(
    data: list[dict],
):

    if len(data) < 50:

        return {
            "signal": "NEUTRAL",
            "score": 0,
            "reasons": [
                "Not enough historical data"
            ],
            "rsi": None,
            "macd": None,
            "macdSignal": None,
            "macdHistogram": None,
        }

    closes = [
        float(item["close"])
        for item in data
    ]

    current_price = closes[-1]

    # EMA

    ema20 = calculate_ema(
        closes,
        20,
    )

    ema50 = calculate_ema(
        closes,
        50,
    )

    # RSI

    rsi = calculate_rsi(
        closes,
        14,
    )

    # MACD

    macd_data = calculate_macd(
        closes
    )

    macd = macd_data["macd"]
    macd_signal = macd_data["signal"]
    macd_histogram = macd_data["histogram"]

    score = 0

    reasons = []

    # --------------------------------
    # EMA 20 vs EMA 50
    # --------------------------------

    if (
        ema20 is not None
        and ema50 is not None
    ):

        if ema20 > ema50:

            score += 1

            reasons.append(
                "EMA 20 is above EMA 50"
            )

        else:

            score -= 1

            reasons.append(
                "EMA 20 is below EMA 50"
            )

    # --------------------------------
    # Price vs EMA 20
    # --------------------------------

    if ema20 is not None:

        if current_price > ema20:

            score += 1

            reasons.append(
                "Price is above EMA 20"
            )

        else:

            score -= 1

            reasons.append(
                "Price is below EMA 20"
            )

    # --------------------------------
    # Price vs EMA 50
    # --------------------------------

    if ema50 is not None:

        if current_price > ema50:

            score += 1

            reasons.append(
                "Price is above EMA 50"
            )

        else:

            score -= 1

            reasons.append(
                "Price is below EMA 50"
            )

    # --------------------------------
    # RSI
    # --------------------------------

    if rsi is not None:

        if rsi < 30:

            score += 1

            reasons.append(
                f"RSI is {rsi:.2f} — potentially oversold"
            )

        elif rsi > 70:

            score -= 1

            reasons.append(
                f"RSI is {rsi:.2f} — potentially overbought"
            )

        else:

            reasons.append(
                f"RSI is {rsi:.2f} — neutral zone"
            )

    # --------------------------------
    # MACD
    # --------------------------------

    if (
        macd is not None
        and macd_signal is not None
    ):

        if macd > macd_signal:

            score += 1

            reasons.append(
                "MACD is above its signal"
            )

        elif macd < macd_signal:

            score -= 1

            reasons.append(
                "MACD is below its signal"
            )

        else:

            reasons.append(
                "MACD is equal to its signal"
            )

    # --------------------------------
    # MACD Histogram
    # --------------------------------

    if macd_histogram is not None:

        if macd_histogram > 0:

            reasons.append(
                "MACD histogram is positive"
            )

        elif macd_histogram < 0:

            reasons.append(
                "MACD histogram is negative"
            )

    # --------------------------------
    # Final Signal
    # --------------------------------

    if score >= 3:

        signal = "BULLISH"

    elif score <= -3:

        signal = "BEARISH"

    else:

        signal = "NEUTRAL"

    return {
        "signal": signal,
        "score": score,
        "reasons": reasons,
        "rsi": rsi,
        "macd": macd,
        "macdSignal": macd_signal,
        "macdHistogram": macd_histogram,
    }