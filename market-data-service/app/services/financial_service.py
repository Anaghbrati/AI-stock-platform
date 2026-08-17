import yfinance as yf


def get_financial_statements(ticker: str):
    stock = yf.Ticker(ticker)

    # ========================================
    # INCOME STATEMENT
    # ========================================

    income_statement = stock.financials

    # ========================================
    # BALANCE SHEET
    # ========================================

    balance_sheet = stock.balance_sheet

    # ========================================
    # CASH FLOW
    # ========================================

    cash_flow = stock.cashflow

    annual = []

    if income_statement is not None and not income_statement.empty:

        for column in income_statement.columns:

            period = str(column.date())

            revenue = income_statement.loc[
                "Total Revenue", column
            ] if "Total Revenue" in income_statement.index else None

            gross_profit = income_statement.loc[
                "Gross Profit", column
            ] if "Gross Profit" in income_statement.index else None

            operating_income = income_statement.loc[
                "Operating Income", column
            ] if "Operating Income" in income_statement.index else None

            net_income = income_statement.loc[
                "Net Income", column
            ] if "Net Income" in income_statement.index else None

            total_assets = (
                balance_sheet.loc[
                    "Total Assets", column
                ]
                if balance_sheet is not None
                and not balance_sheet.empty
                and "Total Assets" in balance_sheet.index
                and column in balance_sheet.columns
                else None
            )

            total_liabilities = (
                balance_sheet.loc[
                    "Total Liabilities Net Minority Interest",
                    column
                ]
                if balance_sheet is not None
                and not balance_sheet.empty
                and "Total Liabilities Net Minority Interest"
                in balance_sheet.index
                and column in balance_sheet.columns
                else None
            )

            total_equity = (
                balance_sheet.loc[
                    "Stockholders Equity",
                    column
                ]
                if balance_sheet is not None
                and not balance_sheet.empty
                and "Stockholders Equity" in balance_sheet.index
                and column in balance_sheet.columns
                else None
            )

            cash = (
                balance_sheet.loc[
                    "Cash Cash Equivalents And Short Term Investments",
                    column
                ]
                if balance_sheet is not None
                and not balance_sheet.empty
                and "Cash Cash Equivalents And Short Term Investments"
                in balance_sheet.index
                and column in balance_sheet.columns
                else None
            )

            total_debt = (
                balance_sheet.loc[
                    "Total Debt",
                    column
                ]
                if balance_sheet is not None
                and not balance_sheet.empty
                and "Total Debt" in balance_sheet.index
                and column in balance_sheet.columns
                else None
            )

            operating_cash_flow = (
                cash_flow.loc[
                    "Operating Cash Flow",
                    column
                ]
                if cash_flow is not None
                and not cash_flow.empty
                and "Operating Cash Flow" in cash_flow.index
                and column in cash_flow.columns
                else None
            )

            investing_cash_flow = (
                cash_flow.loc[
                    "Investing Cash Flow",
                    column
                ]
                if cash_flow is not None
                and not cash_flow.empty
                and "Investing Cash Flow" in cash_flow.index
                and column in cash_flow.columns
                else None
            )

            financing_cash_flow = (
                cash_flow.loc[
                    "Financing Cash Flow",
                    column
                ]
                if cash_flow is not None
                and not cash_flow.empty
                and "Financing Cash Flow" in cash_flow.index
                and column in cash_flow.columns
                else None
            )

            free_cash_flow = (
                cash_flow.loc[
                    "Free Cash Flow",
                    column
                ]
                if cash_flow is not None
                and not cash_flow.empty
                and "Free Cash Flow" in cash_flow.index
                and column in cash_flow.columns
                else None
            )

            annual.append({
                "period": period,

                "revenue": clean_value(revenue),
                "grossProfit": clean_value(gross_profit),
                "operatingIncome": clean_value(operating_income),
                "netIncome": clean_value(net_income),

                "eps": None,

                "totalAssets": clean_value(total_assets),
                "totalLiabilities": clean_value(
                    total_liabilities
                ),
                "totalEquity": clean_value(
                    total_equity
                ),
                "cash": clean_value(cash),
                "totalDebt": clean_value(total_debt),

                "operatingCashFlow": clean_value(
                    operating_cash_flow
                ),
                "investingCashFlow": clean_value(
                    investing_cash_flow
                ),
                "financingCashFlow": clean_value(
                    financing_cash_flow
                ),
                "freeCashFlow": clean_value(
                    free_cash_flow
                ),
            })

    return {
        "ticker": ticker.upper(),
        "annual": annual,
        "quarterly": [],
    }


def clean_value(value):

    if value is None:
        return None

    try:
        if hasattr(value, "item"):
            value = value.item()

        return float(value)

    except Exception:
        return None