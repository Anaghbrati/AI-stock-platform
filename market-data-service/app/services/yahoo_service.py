import math

import yfinance as yf


class YahooFinanceService:

    # ========================================
    # HELPERS
    # ========================================

    @staticmethod
    def safe_float(value):
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
    def first_valid(*values):
        """
        Return the first usable numeric value.
        """

        for value in values:
            number = YahooFinanceService.safe_float(value)

            if number is not None:
                return number

        return None

    @staticmethod
    def is_index(ticker: str) -> bool:
        """
        Yahoo Finance index symbols start with ^.

        Examples:
        ^NSEI
        ^BSESN
        """

        return ticker.startswith("^")

    @staticmethod
    def get_company_name(
        ticker: str,
        info: dict,
    ) -> str:
        """
        Get a human-readable name.

        Yahoo's index metadata is inconsistent, so
        explicit names are provided for important
        Indian indices.
        """

        index_names = {
            "^NSEI": "NIFTY 50",
            "^BSESN": "SENSEX",
        }

        if ticker in index_names:
            return index_names[ticker]

        return (
            info.get("longName")
            or info.get("shortName")
            or info.get("displayName")
            or ticker
        )

    @staticmethod
    def get_history_quote(stock):
        """
        Fallback quote retrieval using historical data.

        This is particularly useful for Yahoo Finance
        indices where stock.info may be incomplete.
        """

        try:
            history = stock.history(
                period="5d",
                interval="1d",
                auto_adjust=False,
            )

        except Exception as error:
            print(
                f"Yahoo history error: {error}"
            )
            return None, None

        if history is None or history.empty:
            return None, None

        closes = history["Close"].dropna()

        if closes.empty:
            return None, None

        current_price = YahooFinanceService.safe_float(
            closes.iloc[-1]
        )

        previous_close = None

        if len(closes) >= 2:
            previous_close = (
                YahooFinanceService.safe_float(
                    closes.iloc[-2]
                )
            )

        return current_price, previous_close

    # ========================================
    # VALIDATE QUOTE
    # ========================================

    @staticmethod
    def validate_quote(
        ticker: str,
        info: dict,
        price=None,
    ):
        """
        Validate that Yahoo Finance returned
        meaningful data.

        Normal stocks:
            require a company name and price.

        Indices:
            only require a valid price because
            Yahoo metadata for indices is inconsistent.
        """

        if not info:
            info = {}

        safe_price = (
            YahooFinanceService.safe_float(price)
        )

        if safe_price is None:
            safe_price = YahooFinanceService.first_valid(
                info.get("currentPrice"),
                info.get("regularMarketPrice"),
                info.get("previousClose"),
            )

        if safe_price is None:
            raise ValueError(
                f"Stock not found: {ticker}"
            )

        if YahooFinanceService.is_index(ticker):
            return True

        company_name = (
            info.get("longName")
            or info.get("shortName")
            or info.get("displayName")
        )

        if not company_name:
            raise ValueError(
                f"Stock not found: {ticker}"
            )

        return True

    # ========================================
    # STOCK QUOTE
    # ========================================

    def get_quote(self, ticker: str):

        ticker = ticker.strip().upper()

        if not ticker:
            raise ValueError(
                "Ticker is required"
            )

        print(
            f"Yahoo Finance: fetching quote for {ticker}"
        )

        # --------------------------------
        # CREATE YAHOO TICKER
        # --------------------------------

        try:
            stock = yf.Ticker(ticker)

        except Exception as error:

            print(
                f"Yahoo Finance ticker error for "
                f"{ticker}: {error}"
            )

            raise ValueError(
                f"Unable to create Yahoo Finance ticker "
                f"for {ticker}"
            ) from error

        # --------------------------------
        # FETCH INFO
        # --------------------------------

        info = {}

        try:
            info = stock.info or {}

        except Exception as error:

            print(
                f"Yahoo Finance info error for "
                f"{ticker}: {error}"
            )

            # Don't immediately fail.
            # history() may still work.

            info = {}

        # --------------------------------
        # PRICE FROM INFO
        # --------------------------------

        price = self.first_valid(
            info.get("currentPrice"),
            info.get("regularMarketPrice"),
            info.get("previousClose"),
        )

        # --------------------------------
        # PREVIOUS CLOSE FROM INFO
        # --------------------------------

        previous_close = self.first_valid(
            info.get(
                "regularMarketPreviousClose"
            ),
            info.get("previousClose"),
        )

        # --------------------------------
        # HISTORY FALLBACK
        # --------------------------------

        history_price = None
        history_previous_close = None

        if price is None or previous_close is None:

            (
                history_price,
                history_previous_close,
            ) = self.get_history_quote(stock)

        # Prefer actual history price when
        # info did not provide one.

        if price is None:
            price = history_price

        if previous_close is None:
            previous_close = (
                history_previous_close
            )

        # --------------------------------
        # VALIDATE
        # --------------------------------

        self.validate_quote(
            ticker,
            info,
            price,
        )

        # --------------------------------
        # COMPANY NAME
        # --------------------------------

        company_name = self.get_company_name(
            ticker,
            info,
        )

        # --------------------------------
        # CHANGE
        # --------------------------------

        change = None

        if (
            price is not None
            and previous_close is not None
            and previous_close != 0
        ):
            change = (
                price - previous_close
            )

        # --------------------------------
        # CHANGE %
        # --------------------------------

        change_percent = None

        if (
            change is not None
            and previous_close is not None
            and previous_close != 0
        ):
            change_percent = (
                change / previous_close
            ) * 100

        # --------------------------------
        # MARKET DATA
        # --------------------------------

        market_cap = self.safe_float(
            info.get("marketCap")
        )

        volume = self.safe_float(
            info.get("volume")
        )

        fifty_two_week_high = (
            self.safe_float(
                info.get("fiftyTwoWeekHigh")
            )
        )

        fifty_two_week_low = (
            self.safe_float(
                info.get("fiftyTwoWeekLow")
            )
        )

        # --------------------------------
        # CURRENCY
        # --------------------------------

        currency = (
            info.get("currency")
            or "INR"
        )

        # --------------------------------
        # RETURN NORMALIZED QUOTE
        # --------------------------------

        return {

            "ticker": ticker,

            "companyName": company_name,

            "price": price,

            "change": change,

            "changePercent": change_percent,

            "currency": currency,

            "marketCap": market_cap,

            "volume": volume,

            "fiftyTwoWeekHigh":
                fifty_two_week_high,

            "fiftyTwoWeekLow":
                fifty_two_week_low,
        }

    # ========================================
    # FUNDAMENTALS
    # ========================================

    def get_fundamentals(
        self,
        ticker: str,
    ):

        ticker = ticker.strip().upper()

        if not ticker:
            raise ValueError(
                "Ticker is required"
            )

        try:

            stock = yf.Ticker(ticker)

            info = stock.info or {}

        except Exception as error:

            print(
                f"Yahoo Finance fundamentals error "
                f"for {ticker}: {error}"
            )

            raise ValueError(
                f"Unable to fetch fundamentals for "
                f"{ticker}"
            ) from error

        # --------------------------------
        # ROE
        # --------------------------------

        roe = self.safe_float(
            info.get("returnOnEquity")
        )

        if roe is not None:
            roe *= 100

        # --------------------------------
        # DIVIDEND YIELD
        # --------------------------------

        dividend_yield = self.safe_float(
            info.get("dividendYield")
        )

        # --------------------------------
        # RETURN
        # --------------------------------

        return {

            "ticker": ticker,

            "peRatio":
                self.safe_float(
                    info.get("trailingPE")
                ),

            "pbRatio":
                self.safe_float(
                    info.get("priceToBook")
                ),

            "roe": roe,

            "debtToEquity":
                self.safe_float(
                    info.get("debtToEquity")
                ),

            "dividendYield":
                dividend_yield,

            "freeCashFlow":
                self.safe_float(
                    info.get("freeCashflow")
                ),

            "eps":
                self.safe_float(
                    info.get("trailingEps")
                ),

            "marketCap":
                self.safe_float(
                    info.get("marketCap")
                ),
        }