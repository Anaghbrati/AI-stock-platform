import yfinance as yf


class YahooFinanceService:

    def get_quote(self, ticker: str):
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info:
            raise ValueError(f"Stock not found: {ticker}")

        return {
            "ticker": ticker.upper(),
            "companyName": info.get("longName") or info.get("shortName"),
            "price": info.get("currentPrice"),
            "currency": info.get("currency"),
            "marketCap": info.get("marketCap"),
            "volume": info.get("volume"),
        }