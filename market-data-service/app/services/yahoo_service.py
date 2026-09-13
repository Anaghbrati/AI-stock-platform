
import math
from typing import Any

import yfinance as yf


class YahooFinanceService:
    """
    Service layer for Yahoo Finance market data.

    Security principles:
    - Never trust incoming ticker strings blindly.
    - Normalize and validate ticker symbols.
    - Never expose Yahoo/internal exceptions directly to clients.
    - Treat missing/invalid market data as unavailable.
    - Keep provider-specific logic inside this service.
    """

    # ---------------------------------------------------------
    # CONFIGURATION
    # ---------------------------------------------------------

    MAX_TICKER_LENGTH = 30
    MAX_SEARCH_LENGTH = 100

    # ---------------------------------------------------------
    # VALIDATION HELPERS
    # ---------------------------------------------------------

    @staticmethod
    def normalize_ticker(ticker: str) -> str:
        """
        Normalize and validate a Yahoo Finance ticker.

        Examples:
            tata motors -> TATA
            TATAMOTORS.NS -> TATAMOTORS.NS
            ^NSEI -> ^NSEI
        """
        if not isinstance(ticker, str):
            raise ValueError("Invalid ticker")

        normalized = ticker.strip().upper()

        if not normalized:
            raise ValueError("Ticker is required")

        if len(normalized) > YahooFinanceService.MAX_TICKER_LENGTH:
            raise ValueError("Invalid ticker")

        # Allow:
        # A-Z
        # 0-9
        # .
        # -
        # ^
        #
        # This covers normal Yahoo symbols such as:
        # RELIANCE.NS
        # TCS.NS
        # ^NSEI
        # BRITANNIA.NS
        allowed = set(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "0123456789"
            ".-^"
        )

        if any(character not in allowed for character in normalized):
            raise ValueError("Invalid ticker")

        return normalized

    @staticmethod
    def normalize_search_query(query: str) -> str:
        """
        Normalize and validate search input.
        """
        if not isinstance(query, str):
            return ""

        normalized = query.strip()

        if len(normalized) > YahooFinanceService.MAX_SEARCH_LENGTH:
            normalized = normalized[
                : YahooFinanceService.MAX_SEARCH_LENGTH
            ]

        return normalized

    # ---------------------------------------------------------
    # NUMBER HELPERS
    # ---------------------------------------------------------

    @staticmethod
    def safe_float(value: Any) -> float | None:
        """
        Safely convert a value to float.

        Returns None for:
        - None
        - invalid values
        - NaN
        - infinity
        """
        if value is None:
            return None

        try:
            number = float(value)

            if not math.isfinite(number):
                return None

            return number

        except (TypeError, ValueError):
            return None

    @staticmethod
    def first_valid(*values: Any) -> float | None:
        """
        Return the first valid numeric value.
        """
        for value in values:
            number = YahooFinanceService.safe_float(value)

            if number is not None:
                return number

        return None

    # ---------------------------------------------------------
    # SYMBOL HELPERS
    # ---------------------------------------------------------

    @staticmethod
    def is_index(ticker: str) -> bool:
        """
        Yahoo Finance indices start with ^.
        """
        return ticker.startswith("^")

    @staticmethod
    def get_company_name(
        ticker: str,
        info: dict[str, Any],
    ) -> str:
        """
        Get a human-readable company/index name.
        """

        index_names = {
            "^NSEI": "NIFTY 50",
            "^BSESN": "SENSEX",
        }

        if ticker in index_names:
            return index_names[ticker]

        return (
            str(info.get("longName") or "").strip()
            or str(info.get("shortName") or "").strip()
            or str(info.get("displayName") or "").strip()
            or ticker
        )

    # ---------------------------------------------------------
    # HISTORY FALLBACK
    # ---------------------------------------------------------

    @classmethod
    def get_history_quote(
        cls,
        stock: Any,
    ) -> tuple[float | None, float | None]:
        """
        Retrieve current/previous close from historical data.

        This acts as a fallback when Yahoo's info endpoint
        doesn't contain usable price fields.
        """

        try:
            history = stock.history(
                period="5d",
                interval="1d",
                auto_adjust=False,
            )

        except Exception as error:
            print(
                f"[Yahoo] History request failed: "
                f"{type(error).__name__}"
            )

            return None, None

        if history is None or history.empty:
            return None, None

        if "Close" not in history.columns:
            return None, None

        closes = history["Close"].dropna()

        if closes.empty:
            return None, None

        current_price = cls.safe_float(
            closes.iloc[-1]
        )

        previous_close = None

        if len(closes) >= 2:
            previous_close = cls.safe_float(
                closes.iloc[-2]
            )

        return current_price, previous_close

    # ---------------------------------------------------------
    # QUOTE VALIDATION
    # ---------------------------------------------------------

    @classmethod
    def validate_quote(
        cls,
        ticker: str,
        info: dict[str, Any],
        price: float | None = None,
    ) -> None:
        """
        Validate that Yahoo returned usable quote data.

        Normal stocks:
            require a valid price.

        Indices:
            require a valid price.

        Company metadata is allowed to be incomplete because
        Yahoo sometimes returns incomplete info responses.
        """

        safe_price = cls.safe_float(price)

        if safe_price is None:
            safe_price = cls.first_valid(
                info.get("currentPrice"),
                info.get("regularMarketPrice"),
                info.get("previousClose"),
            )

        if safe_price is None:
            raise ValueError(
                f"No quote data available for {ticker}"
            )

    # ---------------------------------------------------------
    # STOCK QUOTE
    # ---------------------------------------------------------

    def get_quote(
        self,
        ticker: str,
    ) -> dict[str, Any]:
        """
        Fetch normalized quote data for a ticker.
        """

        ticker = self.normalize_ticker(ticker)

        print(
            f"[Yahoo] Fetching quote for {ticker}"
        )

        # -----------------------------------------------------
        # CREATE YAHOO TICKER
        # -----------------------------------------------------

        try:
            stock = yf.Ticker(ticker)

        except Exception as error:
            print(
                f"[Yahoo] Failed to create ticker "
                f"{ticker}: {type(error).__name__}"
            )

            raise ValueError(
                "Unable to fetch stock data"
            ) from error

        # -----------------------------------------------------
        # FETCH INFO
        # -----------------------------------------------------

        info: dict[str, Any] = {}

        try:
            raw_info = stock.info

            if isinstance(raw_info, dict):
                info = raw_info

        except Exception as error:
            # Do not fail immediately.
            # Historical data may still contain the price.
            print(
                f"[Yahoo] Info request failed for "
                f"{ticker}: {type(error).__name__}"
            )

        # -----------------------------------------------------
        # PRICE FROM INFO
        # -----------------------------------------------------

        price = self.first_valid(
            info.get("currentPrice"),
            info.get("regularMarketPrice"),
            info.get("previousClose"),
        )

        # -----------------------------------------------------
        # PREVIOUS CLOSE
        # -----------------------------------------------------

        previous_close = self.first_valid(
            info.get("regularMarketPreviousClose"),
            info.get("previousClose"),
        )

        # -----------------------------------------------------
        # HISTORY FALLBACK
        # -----------------------------------------------------

        history_price = None
        history_previous_close = None

        if (
            price is None
            or previous_close is None
        ):
            (
                history_price,
                history_previous_close,
            ) = self.get_history_quote(stock)

        if price is None:
            price = history_price

        if previous_close is None:
            previous_close = history_previous_close

        # -----------------------------------------------------
        # VALIDATE
        # -----------------------------------------------------

        self.validate_quote(
            ticker=ticker,
            info=info,
            price=price,
        )

        # -----------------------------------------------------
        # COMPANY NAME
        # -----------------------------------------------------

        company_name = self.get_company_name(
            ticker=ticker,
            info=info,
        )

        # -----------------------------------------------------
        # PRICE CHANGE
        # -----------------------------------------------------

        change = None

        if (
            price is not None
            and previous_close is not None
            and previous_close != 0
        ):
            change = price - previous_close

        # -----------------------------------------------------
        # PRICE CHANGE %
        # -----------------------------------------------------

        change_percent = None

        if (
            change is not None
            and previous_close is not None
            and previous_close != 0
        ):
            change_percent = (
                change / previous_close
            ) * 100

        # -----------------------------------------------------
        # MARKET DATA
        # -----------------------------------------------------

        market_cap = self.safe_float(
            info.get("marketCap")
        )

        volume = self.safe_float(
            info.get("volume")
        )

        fifty_two_week_high = self.safe_float(
            info.get("fiftyTwoWeekHigh")
        )

        fifty_two_week_low = self.safe_float(
            info.get("fiftyTwoWeekLow")
        )

        # -----------------------------------------------------
        # CURRENCY
        # -----------------------------------------------------

        currency = (
            str(info.get("currency") or "").strip()
            or "INR"
        )

        # -----------------------------------------------------
        # RESULT
        # -----------------------------------------------------

        result = {
            "ticker": ticker,
            "companyName": company_name,
            "price": price,
            "change": change,
            "changePercent": change_percent,
            "currency": currency,
            "marketCap": market_cap,
            "volume": volume,
            "fiftyTwoWeekHigh": fifty_two_week_high,
            "fiftyTwoWeekLow": fifty_two_week_low,
        }

        print(
            f"[Yahoo] Quote success: "
            f"{ticker} price={price}"
        )

        return result

    # ---------------------------------------------------------
    # STOCK SEARCH
    # ---------------------------------------------------------

    def search_stocks(
        self,
        query: str,
    ) -> list[dict[str, str]]:
        """
        Search Yahoo Finance for securities.

        Search is intentionally separate from quote retrieval.
        """

        normalized_query = self.normalize_search_query(
            query
        )

        if len(normalized_query) < 2:
            return []

        print(
            f"[Yahoo] Searching for "
            f"'{normalized_query}'"
        )

        try:
            search = yf.Search(
                normalized_query,
                max_results=10,
            )

            quotes = search.quotes or []

        except Exception as error:
            print(
                f"[Yahoo] Search failed: "
                f"{type(error).__name__}"
            )

            raise ValueError(
                "Unable to search Yahoo Finance"
            ) from error

        results: list[dict[str, str]] = []

        for quote in quotes:

            if not isinstance(quote, dict):
                continue

            symbol = str(
                quote.get("symbol") or ""
            ).strip().upper()

            if not symbol:
                continue

            quote_type = str(
                quote.get("quoteType") or ""
            ).upper()

            # Ignore non-security results.
            if quote_type in {
                "NEWS",
                "CURRENCY",
                "CRYPTOCURRENCY",
            }:
                continue

            company_name = (
                str(
                    quote.get("longname")
                    or quote.get("longName")
                    or quote.get("shortname")
                    or quote.get("shortName")
                    or quote.get("displayName")
                    or symbol
                ).strip()
            )

            exchange = str(
                quote.get("exchange")
                or quote.get("fullExchangeName")
                or ""
            ).strip()

            results.append(
                {
                    "ticker": symbol,
                    "companyName": company_name,
                    "exchange": exchange,
                }
            )

        return results

    # ---------------------------------------------------------
    # FUNDAMENTALS
    # ---------------------------------------------------------

    def get_fundamentals(
        self,
        ticker: str,
    ) -> dict[str, Any]:
        """
        Fetch fundamental metrics.
        """

        ticker = self.normalize_ticker(ticker)

        try:
            stock = yf.Ticker(ticker)
            info = stock.info or {}

        except Exception as error:
            print(
                f"[Yahoo] Fundamentals failed for "
                f"{ticker}: {type(error).__name__}"
            )

            raise ValueError(
                "Unable to fetch fundamentals"
            ) from error

        # -----------------------------------------------------
        # ROE
        # -----------------------------------------------------

        roe = self.safe_float(
            info.get("returnOnEquity")
        )

        if roe is not None:
            roe *= 100

        # -----------------------------------------------------
        # DIVIDEND YIELD
        # -----------------------------------------------------

        dividend_yield = self.safe_float(
            info.get("dividendYield")
        )

        # -----------------------------------------------------
        # RESULT
        # -----------------------------------------------------

        return {
            "ticker": ticker,

            "peRatio": self.safe_float(
                info.get("trailingPE")
            ),

            "pbRatio": self.safe_float(
                info.get("priceToBook")
            ),

            "roe": roe,

            "debtToEquity": self.safe_float(
                info.get("debtToEquity")
            ),

            "dividendYield": dividend_yield,

            "freeCashFlow": self.safe_float(
                info.get("freeCashflow")
            ),

            "eps": self.safe_float(
                info.get("trailingEps")
            ),

            "marketCap": self.safe_float(
                info.get("marketCap")
            ),
        }
