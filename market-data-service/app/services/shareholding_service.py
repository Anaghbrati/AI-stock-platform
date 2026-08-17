import yfinance as yf


def get_shareholding(ticker: str):

    stock = yf.Ticker(ticker)

    major_holders = stock.major_holders
    institutional = stock.institutional_holders

    promoter_holding = None
    institutional_holding = None
    mutual_fund_holding = None
    public_holding = None

    # Yahoo Finance does not consistently provide
    # Indian promoter/public classifications.
    # Keep unavailable values as None for now.

    if institutional is not None and not institutional.empty:

        try:
            institutional_holding = float(
                institutional["% Out"]
                .sum()
            ) * 100

        except Exception:
            institutional_holding = None

    return {
        "ticker": ticker.upper(),

        "promoterHolding":
            promoter_holding,

        "institutionalHolding":
            institutional_holding,

        "mutualFundHolding":
            mutual_fund_holding,

        "publicHolding":
            public_holding,
    }