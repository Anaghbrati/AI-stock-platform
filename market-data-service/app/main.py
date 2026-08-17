from app.services.technical_analysis import (
    calculate_technical_signal
)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.historical_service import (
    get_historical_data
)

from app.services.yahoo_service import (
    YahooFinanceService
)

from app.services.financial_service import (
    get_financial_statements
)

from app.services.shareholding_service import (
    get_shareholding
)


app = FastAPI(
    title="AI Stock Platform - Market Data Service",
    version="1.0.0",
)


# ========================================
# CORS CONFIGURATION
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
# STOCK QUOTE
# ========================================

@app.get("/api/quote/{ticker}")
def get_quote(ticker: str):

    try:

        return yahoo_service.get_quote(
            ticker
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ========================================
# FUNDAMENTALS
# ========================================

@app.get("/api/fundamentals/{ticker}")
def get_fundamentals(ticker: str):

    try:

        return yahoo_service.get_fundamentals(
            ticker
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
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

    try:

        return get_historical_data(
            ticker=ticker,
            period=period,
            interval=interval,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ========================================
# TECHNICAL ANALYSIS
# ========================================

@app.get("/api/technical/{ticker}")
def technical_analysis(
    ticker: str
):

    try:

        return calculate_technical_signal(
            ticker
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ========================================
# FINANCIAL STATEMENTS
# ========================================

@app.get("/api/financials/{ticker}")
def financial_statements(
    ticker: str
):

    try:

        return get_financial_statements(
            ticker
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ========================================
# SHAREHOLDING
# ========================================

@app.get("/api/shareholding/{ticker}")
def shareholding(
    ticker: str
):

    try:

        return get_shareholding(
            ticker
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )