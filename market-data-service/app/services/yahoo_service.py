import yfinance as yf


class YahooFinanceService:

    def get_quote(self, ticker: str):
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info:
            raise ValueError(
                f"Stock not found: {ticker}"
            )

        # --------------------------------
        # Current Price
        # --------------------------------

        price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
        )

        # --------------------------------
        # Previous Close
        # --------------------------------

        previous_close = (
            info.get("regularMarketPreviousClose")
            or info.get("previousClose")
        )

        # --------------------------------
        # Change
        # --------------------------------

        change = (
            float(price) - float(previous_close)
            if price is not None
            and previous_close not in (None, 0)
            else None
        )

        # --------------------------------
        # Change %
        # --------------------------------

        change_percent = (
            (change / float(previous_close)) * 100
            if change is not None
            else None
        )

        # --------------------------------
        # Return normalized quote
        # --------------------------------

        return {
            "ticker": ticker.upper(),

            "companyName":
                info.get("longName")
                or info.get("shortName"),

            "price": price,

            "change": change,

            "changePercent":
                change_percent,

            "currency":
                info.get("currency"),

            "marketCap":
                info.get("marketCap"),

            "volume":
                info.get("volume"),

            # --------------------------------
            # 52 Week Range
            # --------------------------------

            "fiftyTwoWeekHigh":
                info.get("fiftyTwoWeekHigh"),

            "fiftyTwoWeekLow":
                info.get("fiftyTwoWeekLow"),
        }