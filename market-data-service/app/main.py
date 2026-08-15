from fastapi import FastAPI, HTTPException

from app.services.yahoo_service import YahooFinanceService


app = FastAPI(
    title="AI Stock Platform - Market Data Service",
    version="1.0.0",
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