import math
import pandas as pd
import yfinance as yf


def clean_value(value):
    """
    Convert NaN / infinity values to None
    so they can safely be returned as JSON.
    """

    if value is None:
        return None

    try:
        value = float(value)

        if math.isnan(value) or math.isinf(value):
            return None

        return value

    except (TypeError, ValueError):
        return None


def get_financial_statements(ticker: str):

    stock = yf.Ticker(ticker)

    # ========================================
    # ANNUAL STATEMENTS
    # ========================================

    annual_income = stock.financials
    annual_balance = stock.balance_sheet
    annual_cashflow = stock.cashflow

    annual = []

    if annual_income is not None and not annual_income.empty:

        for column in annual_income.columns:

            period = str(column.date())

            annual.append(
                {
                    "period": period,

                    "revenue": clean_value(
                        annual_income.loc["Total Revenue", column]
                        if "Total Revenue" in annual_income.index
                        else None
                    ),

                    "grossProfit": clean_value(
                        annual_income.loc["Gross Profit", column]
                        if "Gross Profit" in annual_income.index
                        else None
                    ),

                    "operatingIncome": clean_value(
                        annual_income.loc["Operating Income", column]
                        if "Operating Income" in annual_income.index
                        else None
                    ),

                    "netIncome": clean_value(
                        annual_income.loc["Net Income", column]
                        if "Net Income" in annual_income.index
                        else None
                    ),

                    "eps": clean_value(
                        annual_income.loc["Diluted EPS", column]
                        if "Diluted EPS" in annual_income.index
                        else (
                            annual_income.loc["Basic EPS", column]
                            if "Basic EPS" in annual_income.index
                            else None
                        )
                    ),

                    "totalAssets": clean_value(
                        annual_balance.loc["Total Assets", column]
                        if annual_balance is not None
                        and not annual_balance.empty
                        and "Total Assets" in annual_balance.index
                        and column in annual_balance.columns
                        else None
                    ),

                    "totalLiabilities": clean_value(
                        annual_balance.loc[
                            "Total Liabilities Net Minority Interest",
                            column,
                        ]
                        if annual_balance is not None
                        and not annual_balance.empty
                        and "Total Liabilities Net Minority Interest"
                        in annual_balance.index
                        and column in annual_balance.columns
                        else None
                    ),

                    "totalEquity": clean_value(
                        annual_balance.loc[
                            "Stockholders Equity",
                            column,
                        ]
                        if annual_balance is not None
                        and not annual_balance.empty
                        and "Stockholders Equity"
                        in annual_balance.index
                        and column in annual_balance.columns
                        else None
                    ),

                    "cash": clean_value(
                        annual_balance.loc[
                            "Cash Cash Equivalents And Short Term Investments",
                            column,
                        ]
                        if annual_balance is not None
                        and not annual_balance.empty
                        and "Cash Cash Equivalents And Short Term Investments"
                        in annual_balance.index
                        and column in annual_balance.columns
                        else None
                    ),

                    "totalDebt": clean_value(
                        annual_balance.loc[
                            "Total Debt",
                            column,
                        ]
                        if annual_balance is not None
                        and not annual_balance.empty
                        and "Total Debt" in annual_balance.index
                        and column in annual_balance.columns
                        else None
                    ),

                    "operatingCashFlow": clean_value(
                        annual_cashflow.loc[
                            "Operating Cash Flow",
                            column,
                        ]
                        if annual_cashflow is not None
                        and not annual_cashflow.empty
                        and "Operating Cash Flow"
                        in annual_cashflow.index
                        and column in annual_cashflow.columns
                        else None
                    ),

                    "investingCashFlow": clean_value(
                        annual_cashflow.loc[
                            "Investing Cash Flow",
                            column,
                        ]
                        if annual_cashflow is not None
                        and not annual_cashflow.empty
                        and "Investing Cash Flow"
                        in annual_cashflow.index
                        and column in annual_cashflow.columns
                        else None
                    ),

                    "financingCashFlow": clean_value(
                        annual_cashflow.loc[
                            "Financing Cash Flow",
                            column,
                        ]
                        if annual_cashflow is not None
                        and not annual_cashflow.empty
                        and "Financing Cash Flow"
                        in annual_cashflow.index
                        and column in annual_cashflow.columns
                        else None
                    ),

                    "freeCashFlow": clean_value(
                        annual_cashflow.loc[
                            "Free Cash Flow",
                            column,
                        ]
                        if annual_cashflow is not None
                        and not annual_cashflow.empty
                        and "Free Cash Flow"
                        in annual_cashflow.index
                        and column in annual_cashflow.columns
                        else None
                    ),
                }
            )

    # ========================================
    # QUARTERLY STATEMENTS
    # ========================================

    quarterly_income = stock.quarterly_financials
    quarterly_balance = stock.quarterly_balance_sheet
    quarterly_cashflow = stock.quarterly_cashflow

    quarterly = []

    if (
        quarterly_income is not None
        and not quarterly_income.empty
    ):

        for column in quarterly_income.columns:

            period = str(column.date())

            quarterly.append(
                {
                    "period": period,

                    "revenue": clean_value(
                        quarterly_income.loc[
                            "Total Revenue",
                            column,
                        ]
                        if "Total Revenue"
                        in quarterly_income.index
                        else None
                    ),

                    "grossProfit": clean_value(
                        quarterly_income.loc[
                            "Gross Profit",
                            column,
                        ]
                        if "Gross Profit"
                        in quarterly_income.index
                        else None
                    ),

                    "operatingIncome": clean_value(
                        quarterly_income.loc[
                            "Operating Income",
                            column,
                        ]
                        if "Operating Income"
                        in quarterly_income.index
                        else None
                    ),

                    "netIncome": clean_value(
                        quarterly_income.loc[
                            "Net Income",
                            column,
                        ]
                        if "Net Income"
                        in quarterly_income.index
                        else None
                    ),

                    "eps": clean_value(
                        quarterly_income.loc[
                            "Diluted EPS",
                            column,
                        ]
                        if "Diluted EPS"
                        in quarterly_income.index
                        else (
                            quarterly_income.loc[
                                "Basic EPS",
                                column,
                            ]
                            if "Basic EPS"
                            in quarterly_income.index
                            else None
                        )
                    ),

                    "totalAssets": clean_value(
                        quarterly_balance.loc[
                            "Total Assets",
                            column,
                        ]
                        if quarterly_balance is not None
                        and not quarterly_balance.empty
                        and "Total Assets"
                        in quarterly_balance.index
                        and column
                        in quarterly_balance.columns
                        else None
                    ),

                    "totalLiabilities": clean_value(
                        quarterly_balance.loc[
                            "Total Liabilities Net Minority Interest",
                            column,
                        ]
                        if quarterly_balance is not None
                        and not quarterly_balance.empty
                        and "Total Liabilities Net Minority Interest"
                        in quarterly_balance.index
                        and column
                        in quarterly_balance.columns
                        else None
                    ),

                    "totalEquity": clean_value(
                        quarterly_balance.loc[
                            "Stockholders Equity",
                            column,
                        ]
                        if quarterly_balance is not None
                        and not quarterly_balance.empty
                        and "Stockholders Equity"
                        in quarterly_balance.index
                        and column
                        in quarterly_balance.columns
                        else None
                    ),

                    "cash": clean_value(
                        quarterly_balance.loc[
                            "Cash Cash Equivalents And Short Term Investments",
                            column,
                        ]
                        if quarterly_balance is not None
                        and not quarterly_balance.empty
                        and "Cash Cash Equivalents And Short Term Investments"
                        in quarterly_balance.index
                        and column
                        in quarterly_balance.columns
                        else None
                    ),

                    "totalDebt": clean_value(
                        quarterly_balance.loc[
                            "Total Debt",
                            column,
                        ]
                        if quarterly_balance is not None
                        and not quarterly_balance.empty
                        and "Total Debt"
                        in quarterly_balance.index
                        and column
                        in quarterly_balance.columns
                        else None
                    ),

                    "operatingCashFlow": clean_value(
                        quarterly_cashflow.loc[
                            "Operating Cash Flow",
                            column,
                        ]
                        if quarterly_cashflow is not None
                        and not quarterly_cashflow.empty
                        and "Operating Cash Flow"
                        in quarterly_cashflow.index
                        and column
                        in quarterly_cashflow.columns
                        else None
                    ),

                    "investingCashFlow": clean_value(
                        quarterly_cashflow.loc[
                            "Investing Cash Flow",
                            column,
                        ]
                        if quarterly_cashflow is not None
                        and not quarterly_cashflow.empty
                        and "Investing Cash Flow"
                        in quarterly_cashflow.index
                        and column
                        in quarterly_cashflow.columns
                        else None
                    ),

                    "financingCashFlow": clean_value(
                        quarterly_cashflow.loc[
                            "Financing Cash Flow",
                            column,
                        ]
                        if quarterly_cashflow is not None
                        and not quarterly_cashflow.empty
                        and "Financing Cash Flow"
                        in quarterly_cashflow.index
                        and column
                        in quarterly_cashflow.columns
                        else None
                    ),

                    "freeCashFlow": clean_value(
                        quarterly_cashflow.loc[
                            "Free Cash Flow",
                            column,
                        ]
                        if quarterly_cashflow is not None
                        and not quarterly_cashflow.empty
                        and "Free Cash Flow"
                        in quarterly_cashflow.index
                        and column
                        in quarterly_cashflow.columns
                        else None
                    ),
                }
            )

    # ========================================
    # FINAL RESPONSE
    # ========================================

    return {
        "ticker": ticker.upper(),
        "annual": annual,
        "quarterly": quarterly,
    }