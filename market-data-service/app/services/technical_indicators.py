import pandas as pd


# =========================================
# SMA
# =========================================

def calculate_sma(
    series: pd.Series,
    period: int
):
    return series.rolling(
        window=period
    ).mean()


# =========================================
# EMA
# =========================================

def calculate_ema(
    series: pd.Series,
    period: int
):
    return series.ewm(
        span=period,
        adjust=False
    ).mean()


# =========================================
# RSI
# =========================================

def calculate_rsi(
    series: pd.Series,
    period: int = 14
):

    delta = series.diff()

    gain = delta.clip(
        lower=0
    )

    loss = -delta.clip(
        upper=0
    )

    average_gain = gain.rolling(
        window=period
    ).mean()

    average_loss = loss.rolling(
        window=period
    ).mean()

    rs = (
        average_gain /
        average_loss
    )

    rsi = 100 - (
        100 /
        (1 + rs)
    )

    return rsi


# =========================================
# MACD
# =========================================

def calculate_macd(
    series: pd.Series
):

    ema12 = calculate_ema(
        series,
        12
    )

    ema26 = calculate_ema(
        series,
        26
    )

    macd = ema12 - ema26

    signal = calculate_ema(
        macd,
        9
    )

    histogram = macd - signal

    return {
        "macd": macd,
        "signal": signal,
        "histogram": histogram,
    }


# =========================================
# ALL INDICATORS
# =========================================

def calculate_indicators(
    dataframe: pd.DataFrame
):

    df = dataframe.copy()

    df["sma20"] = calculate_sma(
        df["Close"],
        20
    )

    df["sma50"] = calculate_sma(
        df["Close"],
        50
    )

    df["ema20"] = calculate_ema(
        df["Close"],
        20
    )

    df["ema50"] = calculate_ema(
        df["Close"],
        50
    )

    df["rsi"] = calculate_rsi(
        df["Close"]
    )

    macd = calculate_macd(
        df["Close"]
    )

    df["macd"] = macd["macd"]

    df["macdSignal"] = macd[
        "signal"
    ]

    df["macdHistogram"] = macd[
        "histogram"
    ]

    return df