from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.technical_analysis import (
    calculate_technical_signal,
)

from app.services.historical_service import (
    get_historical_data,
)

from app.services.yahoo_service import (
    YahooFinanceService,
)

from app.services.financial_service import (
    get_financial_statements,
)

from app.services.shareholding_service import (
    get_shareholding,
)


# ========================================
# APPLICATION
# ========================================

app = FastAPI(
    title="AI Stock Platform - Market Data Service",
    version="1.0.0",
)


# ========================================
# CORS
# ========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================================
# SERVICES
# ========================================

yahoo_service = YahooFinanceService()


# ========================================
# ROOT
# ========================================

@app.get("/")
def root():
    return {
        "service": "market-data-service",
        "status": "running",
    }


# ========================================
# HEALTH
# ========================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# ========================================
# STOCK QUOTE
# ========================================

@app.get("/api/quote/{ticker}")
def get_quote(ticker: str):

    normalized_ticker = ticker.strip().upper()

    if not normalized_ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required",
        )

    try:

        quote = yahoo_service.get_quote(
            normalized_ticker
        )

        return quote

    except ValueError as error:

        print(
            f"Quote validation error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        print(
            f"Quote service error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to fetch market data "
                f"for {normalized_ticker}"
            ),
        )


# ========================================
# FUNDAMENTALS
# ========================================

@app.get("/api/fundamentals/{ticker}")
def get_fundamentals(ticker: str):

    normalized_ticker = ticker.strip().upper()

    if not normalized_ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required",
        )

    try:

        return yahoo_service.get_fundamentals(
            normalized_ticker
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        print(
            f"Fundamentals error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to fetch fundamentals "
                f"for {normalized_ticker}"
            ),
        )


# ========================================
# HISTORICAL DATA
# ========================================

@app.get("/api/historical/{ticker}")
def historical_data(
    ticker: str,
    period: str = "1y",
    interval: str = "1d",
):

    normalized_ticker = ticker.strip().upper()

    if not normalized_ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required",
        )

    try:

        data = get_historical_data(
            ticker=normalized_ticker,
            period=period,
            interval=interval,
        )

        return data

    except ValueError as error:

        print(
            f"Historical data validation error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        print(
            f"Historical data error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to fetch historical data "
                f"for {normalized_ticker}"
            ),
        )


# ========================================
# TECHNICAL ANALYSIS
# ========================================

@app.get("/api/technical/{ticker}")
def technical_analysis(
    ticker: str,
):

    normalized_ticker = ticker.strip().upper()

    if not normalized_ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required",
        )

    try:

        return calculate_technical_signal(
            normalized_ticker
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        print(
            f"Technical analysis error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to calculate technical "
                f"analysis for {normalized_ticker}"
            ),
        )


# ========================================
# FINANCIAL STATEMENTS
# ========================================

@app.get("/api/financials/{ticker}")
def financial_statements(
    ticker: str,
):

    normalized_ticker = ticker.strip().upper()

    if not normalized_ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required",
        )

    try:

        return get_financial_statements(
            normalized_ticker
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        print(
            f"Financial statements error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to fetch financial statements "
                f"for {normalized_ticker}"
            ),
        )


# ========================================
# SHAREHOLDING
# ========================================

@app.get("/api/shareholding/{ticker}")
def shareholding(
    ticker: str,
):

    normalized_ticker = ticker.strip().upper()

    if not normalized_ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required",
        )

    try:

        return get_shareholding(
            normalized_ticker
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        print(
            f"Shareholding error "
            f"for {normalized_ticker}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to fetch shareholding "
                f"for {normalized_ticker}"
            ),
        )