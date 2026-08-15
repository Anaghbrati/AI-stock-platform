import yfinance as yf


def get_historical_data(
    ticker: str,
    period: str = "1y",
    interval: str = "1d",
):
    stock = yf.Ticker(ticker)

    history = stock.history(
        period=period,
        interval=interval,
        auto_adjust=False,
    )

    if history.empty:
        return []

    # Make sure data is chronological
    history = history.sort_index()

    data = []
    seen_times = set()

    for index, row in history.iterrows():

        # Daily/weekly/monthly data
        if interval in ["1d", "5d", "1wk", "1mo", "3mo"]:
            time_value = index.strftime("%Y-%m-%d")

        # Intraday data
        else:
            time_value = int(index.timestamp())

        # Prevent duplicate timestamps
        if time_value in seen_times:
            continue

        seen_times.add(time_value)

        data.append(
            {
                "time": time_value,
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
        )

    return data