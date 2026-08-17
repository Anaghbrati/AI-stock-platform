
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
    def validate_quote(
        ticker: str,
        info: dict,
    ):
        """
        Validate that Yahoo Finance returned a
        meaningful stock/security.

        We require:
        - company name
        - some usable price information

        This prevents invalid tickers such as
        INVALID123 from being treated as valid.
        """

        if not info:
            raise ValueError(
                f"Stock not found: {ticker}"
            )

        company_name = (
            info.get("longName")
            or info.get("shortName")
            or info.get("displayName")
        )

        price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
            or info.get("previousClose")
        )

        if not company_name:
            raise ValueError(
                f"Stock not found: {ticker}"
            )

        if price is None:
            raise ValueError(
                f"Stock not found: {ticker}"
            )

        safe_price = YahooFinanceService.safe_float(
            price
        )

        if safe_price is None:
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

        try:

            stock = yf.Ticker(ticker)

            info = stock.info

        except Exception as error:

            print(
                f"Yahoo Finance error for {ticker}: "
                f"{error}"
            )

            raise ValueError(
                f"Unable to fetch stock data for {ticker}"
            ) from error


        # --------------------------------
        # VALIDATE STOCK
        # --------------------------------

        self.validate_quote(
            ticker,
            info,
        )


        # --------------------------------
        # COMPANY NAME
        # --------------------------------

        company_name = (
            info.get("longName")
            or info.get("shortName")
            or info.get("displayName")
        )


        # --------------------------------
        # CURRENT PRICE
        # --------------------------------

        price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
        )

        price = self.safe_float(price)


        # --------------------------------
        # PREVIOUS CLOSE
        # --------------------------------

        previous_close = (
            info.get(
                "regularMarketPreviousClose"
            )
            or info.get("previousClose")
        )

        previous_close = self.safe_float(
            previous_close
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
                change
                / previous_close
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
        # RETURN NORMALIZED QUOTE
        # --------------------------------

        return {

            "ticker": ticker,

            "companyName": company_name,

            "price": price,

            "change": change,

            "changePercent": change_percent,

            "currency":
                info.get("currency"),

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

            info = stock.info

        except Exception as error:

            print(
                f"Yahoo Finance fundamentals error "
                f"for {ticker}: {error}"
            )

            raise ValueError(
                f"Unable to fetch fundamentals for {ticker}"
            ) from error


        # --------------------------------
        # VALIDATE STOCK
        # --------------------------------

        self.validate_quote(
            ticker,
            info,
        )


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

            # Valuation

            "peRatio":
                self.safe_float(
                    info.get("trailingPE")
                ),

            "pbRatio":
                self.safe_float(
                    info.get("priceToBook")
                ),

            # Profitability

            "roe":
                roe,

            # Financial Health

            "debtToEquity":
                self.safe_float(
                    info.get("debtToEquity")
                ),

            # Dividend

            "dividendYield":
                dividend_yield,

            # Cash Flow

            "freeCashFlow":
                self.safe_float(
                    info.get("freeCashflow")
                ),

            # Earnings

            "eps":
                self.safe_float(
                    info.get("trailingEps")
                ),

            # Market Cap

            "marketCap":
                self.safe_float(
                    info.get("marketCap")
                ),

        }
