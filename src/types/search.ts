export type StockSearchResult = {
  symbol: string;
  name: string;
  exchange: string;
};

export type StockSearchResponse = {
  success: boolean;
  results: StockSearchResult[];
  error?: string;
};