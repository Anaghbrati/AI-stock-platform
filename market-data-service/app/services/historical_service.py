
import math

import yfinance as yf


# ========================================
# SAFE NUMBER CONVERSION
# ========================================

def safe_float(value):
    """
    Convert Yahoo Finance values safely.

    Returns None for:
    - None
    - NaN
    - Infinity
    - invalid values
    """

    try:
        if value is None:
            return None

        number = float(value)

        if not math.isfinite(number):
            return None

        return number

    except (TypeError, ValueError):
        return None


def safe_int(value):
    """
    Safely convert volume to integer.
    """

    try:
        if value is None:
            return 0

        number = float(value)

        if not math.isfinite(number):
            return 0

        return int(number)

    except (TypeError, ValueError):
        return 0


# ========================================
# HISTORICAL DATA
# ========================================

def get_historical_data(
    ticker: str,
    period: str = "1y",
    interval: str = "1d",
):
    """
    Fetch historical OHLCV data from Yahoo Finance.

    Supported examples:

        1d  + 5m
        5d  + 15m
        1mo + 1d
        6mo + 1d
        1y  + 1d
        5y  + 1wk
    """

    ticker = ticker.strip().upper()

    # ========================================
    # VALID PERIODS
    # ========================================

    allowed_periods = {
        "1d",
        "5d",
        "1mo",
        "3mo",
        "6mo",
        "1y",
        "2y",
        "5y",
        "10y",
        "max",
    }

    if period not in allowed_periods:
        raise ValueError(
            f"Unsupported historical period: {period}"
        )

    # ========================================
    # VALID INTERVALS
    # ========================================

    allowed_intervals = {
        "1m",
        "2m",
        "5m",
        "15m",
        "30m",
        "60m",
        "90m",
        "1h",
        "1d",
        "5d",
        "1wk",
        "1mo",
        "3mo",
    }

    if interval not in allowed_intervals:
        raise ValueError(
            f"Unsupported historical interval: {interval}"
        )

    # ========================================
    # YAHOO FINANCE
    # ========================================

    try:

        stock = yf.Ticker(ticker)

        history = stock.history(
            period=period,
            interval=interval,
            auto_adjust=False,
        )

    except Exception as error:

        print(
            f"Yahoo historical data error "
            f"for {ticker}: {error}"
        )

        raise ValueError(
            f"Failed to fetch historical data for {ticker}"
        )

    # ========================================
    # EMPTY RESPONSE
    # ========================================

    if history is None or history.empty:
        return []

    # ========================================
    # SORT CHRONOLOGICALLY
    # ========================================

    history = history.sort_index()

    data = []

    seen_times = set()

    # ========================================
    # PROCESS ROWS
    # ========================================

    for index, row in history.iterrows():

        # ------------------------------------
        # OHLC
        # ------------------------------------

        open_price = safe_float(
            row.get("Open")
        )

        high_price = safe_float(
            row.get("High")
        )

        low_price = safe_float(
            row.get("Low")
        )

        close_price = safe_float(
            row.get("Close")
        )

        volume = safe_int(
            row.get("Volume")
        )

        # ------------------------------------
        # Skip invalid OHLC rows
        # ------------------------------------

        if (
            open_price is None
            or high_price is None
            or low_price is None
            or close_price is None
        ):
            continue

        # ====================================
        # TIMESTAMP
        # ====================================

        if interval in {
            "1d",
            "5d",
            "1wk",
            "1mo",
            "3mo",
        }:

            time_value = index.strftime(
                "%Y-%m-%d"
            )

        else:

            try:

                time_value = int(
                    index.timestamp()
                )

            except Exception:

                continue

        # ====================================
        # DUPLICATE PROTECTION
        # ====================================

        if time_value in seen_times:
            continue

        seen_times.add(time_value)

        # ====================================
        # APPEND DATA
        # ====================================

        data.append(
            {
                "time": time_value,

                "open": round(
                    open_price,
                    2,
                ),

                "high": round(
                    high_price,
                    2,
                ),

                "low": round(
                    low_price,
                    2,
                ),

                "close": round(
                    close_price,
                    2,
                ),

                "volume": volume,
            }
        )

    # ========================================
    # FINAL SAFETY CHECK
    # ========================================

    return data
