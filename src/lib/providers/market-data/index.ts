import type { MarketDataProvider } from "./provider";
import { YahooFinanceProvider } from "./yahoo";

const providerType =
  process.env.MARKET_DATA_PROVIDER || "yahoo";

let provider: MarketDataProvider | null = null;

export function getMarketDataProvider(): MarketDataProvider {
  if (provider) {
    return provider;
  }

  switch (providerType) {
    case "yahoo":
      provider = new YahooFinanceProvider();
      break;

    default:
      throw new Error(
        `Unsupported market data provider: ${providerType}`
      );
  }

  return provider;
}