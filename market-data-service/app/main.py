from app.services.technical_analysis import calculate_technical_signal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


from app.services.historical_service import get_historical_data
from app.services.yahoo_service import YahooFinanceService


app = FastAPI(
    title="AI Stock Platform - Market Data Service",
    version="1.0.0",
)


# CORS Configuration
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


yahoo_service = YahooFinanceService()


@app.get("/")
def root():
    return {
        "service": "market-data-service",
        "status": "running",
    }


@app.get("/api/quote/{ticker}")
def get_quote(ticker: str):
    try:
        return yahoo_service.get_quote(ticker)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


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