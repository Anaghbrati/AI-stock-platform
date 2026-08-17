import yfinance as yf


def safe_float(value):
    """
    Safely convert a value to float.

    Returns None for:
    - None
    - NaN
    - invalid values
    """

    try:
        if value is None:
            return None

        result = float(value)

        if result != result:  # NaN
            return None

        return result

    except (TypeError, ValueError):
        return None


def normalize_percentage(value):
    """
    Convert Yahoo/yfinance ownership values to 0-100%.

    Examples:
        0.25 -> 25.0
        25   -> 25.0
    """

    number = safe_float(value)

    if number is None:
        return None

    if 0 <= number <= 1:
        number *= 100

    return round(
        min(max(number, 0), 100),
        2,
    )


def get_shareholding(ticker: str):

    ticker = ticker.strip().upper()

    stock = yf.Ticker(ticker)

    insider_holding = None
    institutional_holding = None

    # ========================================
    # 1. PRIMARY SOURCE: stock.info
    # ========================================

    try:

        info = stock.info

        if info:

            # --------------------------------
            # INSIDER OWNERSHIP
            # --------------------------------

            insider_holding = normalize_percentage(
                info.get("heldPercentInsiders")
            )

            # --------------------------------
            # INSTITUTIONAL OWNERSHIP
            # --------------------------------

            institutional_holding = normalize_percentage(
                info.get("heldPercentInstitutions")
            )

    except Exception as error:

        print(
            f"stock.info shareholding error "
            f"for {ticker}: {error}"
        )


    # ========================================
    # 2. FALLBACK: MAJOR HOLDERS
    # ========================================

    if (
        insider_holding is None
        or institutional_holding is None
    ):

        try:

            major_holders = stock.major_holders

            if (
                major_holders is not None
                and not major_holders.empty
            ):

                for _, row in major_holders.iterrows():

                    if len(row) < 2:
                        continue

                    value = row.iloc[0]

                    description = str(
                        row.iloc[1]
                    ).lower()

                    percentage = (
                        normalize_percentage(value)
                    )

                    if percentage is None:
                        continue

                    # --------------------------------
                    # INSIDERS
                    # --------------------------------

                    if (
                        insider_holding is None
                        and "insider" in description
                    ):

                        insider_holding = percentage

                    # --------------------------------
                    # INSTITUTIONS
                    # --------------------------------

                    if (
                        institutional_holding is None
                        and (
                            "institution" in description
                            or "institutional" in description
                        )
                    ):

                        institutional_holding = percentage

        except Exception as error:

            print(
                f"major_holders fallback error "
                f"for {ticker}: {error}"
            )


    # ========================================
    # 3. FALLBACK: INSIDER HOLDERS
    # ========================================

    if insider_holding is None:

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

                    if column not in insider.columns:
                        continue

                    values = (
                        insider[column]
                        .dropna()
                    )

                    numbers = []

                    for value in values:

                        percentage = (
                            normalize_percentage(
                                value
                            )
                        )

                        if percentage is not None:
                            numbers.append(
                                percentage
                            )

                    if numbers:

                        # Do not sum individual insiders.
                        # Use the largest available aggregate
                        # ownership value.

                        insider_holding = max(
                            numbers
                        )

                        break

        except Exception as error:

            print(
                f"insider_holders fallback error "
                f"for {ticker}: {error}"
            )


    # ========================================
    # 4. FALLBACK: INSTITUTIONAL HOLDERS
    # ========================================

    if institutional_holding is None:

        try:

            institutional = (
                stock.institutional_holders
            )

            if (
                institutional is not None
                and not institutional.empty
            ):

                if "% Out" in institutional.columns:

                    values = (
                        institutional["% Out"]
                        .dropna()
                    )

                    numbers = []

                    for value in values:

                        percentage = (
                            normalize_percentage(
                                value
                            )
                        )

                        if percentage is not None:
                            numbers.append(
                                percentage
                            )

                    if numbers:

                        # This is only an estimate.
                        # Individual institutional rows
                        # are not guaranteed to represent
                        # the complete institutional category.

                        institutional_holding = min(
                            sum(numbers),
                            100,
                        )

        except Exception as error:

            print(
                f"institutional_holders fallback error "
                f"for {ticker}: {error}"
            )


    # ========================================
    # 5. CLEAN VALUES
    # ========================================

    if insider_holding is not None:

        insider_holding = round(
            min(
                max(
                    insider_holding,
                    0,
                ),
                100,
            ),
            2,
        )


    if institutional_holding is not None:

        institutional_holding = round(
            min(
                max(
                    institutional_holding,
                    0,
                ),
                100,
            ),
            2,
        )


    # ========================================
    # 6. CALCULATE REMAINING OWNERSHIP
    # ========================================

    known_percentage = (
        (insider_holding or 0)
        + (institutional_holding or 0)
    )

    # Prevent impossible values.
    known_percentage = min(
        max(known_percentage, 0),
        100,
    )

    public_holding = round(
        100 - known_percentage,
        2,
    )


    # ========================================
    # 7. RETURN
    # ========================================

    return {

        "ticker": ticker,

        # Yahoo Finance generally does not give
        # reliable Indian promoter classification.
        "promoterHolding": None,

        "institutionalHolding":
            institutional_holding,

        # Yahoo does not reliably expose a complete
        # mutual-fund ownership percentage.
        "mutualFundHolding": None,

        "publicHolding":
            public_holding,

        "insiderHolding":
            insider_holding,
    }