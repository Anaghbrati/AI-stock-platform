import type { MarketDataProvider } from "./provider";
import { YahooFinanceProvider } from "./yahoo";

const provider = process.env.MARKET_DATA_PROVIDER || "yahoo";

export function getMarketDataProvider(): MarketDataProvider {
  switch (provider) {
    case "yahoo":
      return new YahooFinanceProvider();

    default:
      throw new Error(
        `Unsupported market data provider: ${provider}`
      );
  }
}