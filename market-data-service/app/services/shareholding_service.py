import yfinance as yf


def safe_float(value):
    """
    Convert a value to float safely.
    Returns None for invalid / NaN values.
    """

    try:
        if value is None:
            return None

        result = float(value)

        if result != result:  # NaN check
            return None

        return result

    except (TypeError, ValueError):
        return None


def get_shareholding(ticker: str):

    stock = yf.Ticker(ticker)

    institutional_holding = None
    insider_holding = None

    # ========================================
    # INSTITUTIONAL HOLDING
    # ========================================

    try:

        institutional = stock.institutional_holders

        if (
            institutional is not None
            and not institutional.empty
            and "% Out" in institutional.columns
        ):

            values = institutional["% Out"].dropna()

            if not values.empty:

                total = 0.0

                for value in values:

                    number = safe_float(value)

                    if number is not None:
                        total += number

                # "% Out" is already represented
                # as a decimal in yfinance.
                #
                # Example:
                # 0.12 = 12%

                institutional_holding = (
                    total * 100
                )

    except Exception as error:

        print(
            f"Institutional holding error for "
            f"{ticker}: {error}"
        )

        institutional_holding = None


    # ========================================
    # INSIDER HOLDING
    # ========================================

    try:

        insider = stock.insider_holders

        if (
            insider is not None
            and not insider.empty
        ):

            possible_columns = [
                "% Held",
                "% Owned",
                "Percent Held",
            ]

            for column in possible_columns:

                if column in insider.columns:

                    values = (
                        insider[column]
                        .dropna()
                    )

                    if not values.empty:

                        number = safe_float(
                            values.iloc[0]
                        )

                        if number is not None:

                            # If yfinance returns
                            # decimal representation
                            # convert to percentage.

                            if number <= 1:

                                insider_holding = (
                                    number * 100
                                )

                            else:

                                insider_holding = number

                    break

    except Exception as error:

        print(
            f"Insider holding error for "
            f"{ticker}: {error}"
        )

        insider_holding = None


    # ========================================
    # CLEAN VALUES
    # ========================================

    if institutional_holding is not None:

        institutional_holding = min(
            max(institutional_holding, 0),
            100
        )


    if insider_holding is not None:

        insider_holding = min(
            max(insider_holding, 0),
            100
        )


    # ========================================
    # OTHER / UNCLASSIFIED
    # ========================================

    known_percentage = 0.0

    if institutional_holding is not None:
        known_percentage += institutional_holding

    if insider_holding is not None:
        known_percentage += insider_holding


    other_holding = 100 - known_percentage

    if other_holding < 0:
        other_holding = 0


    # ========================================
    # RETURN
    # ========================================

    return {

        "ticker": ticker.upper(),

        "promoterHolding": None,

        "institutionalHolding":
            institutional_holding,

        "mutualFundHolding": None,

        "publicHolding":
            round(other_holding, 2),

        "insiderHolding":
            insider_holding,
    }