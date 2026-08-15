import { getStockQuote } from "../../../lib/services/stock.service";

interface StockPageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function StockPage({
  params,
}: StockPageProps) {
  const { ticker } = await params;

  const stock = await getStockQuote(ticker);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <p className="text-slate-400 text-sm">
            Stock Analysis
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {stock.companyName}
          </h1>

          <p className="text-slate-400 mt-2">
            {stock.ticker}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">
              Current Price
            </p>

            <p className="text-3xl font-bold mt-2">
              {stock.currency === "INR" ? "₹" : "$"}
              {stock.price ?? "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">
              Volume
            </p>

            <p className="text-2xl font-semibold mt-2">
              {stock.volume?.toLocaleString() ?? "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">
              Market Cap
            </p>

            <p className="text-2xl font-semibold mt-2">
              {stock.marketCap?.toLocaleString() ?? "N/A"}
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Market Information
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">

            <div>
              <p className="text-slate-400 text-sm">
                Ticker
              </p>
              <p className="font-medium mt-1">
                {stock.ticker}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">
                Currency
              </p>
              <p className="font-medium mt-1">
                {stock.currency ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">
                Change
              </p>
              <p className="font-medium mt-1">
                {stock.changePercent ?? 0}%
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">
                Data Provider
              </p>
              <p className="font-medium mt-1">
                Yahoo Finance
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}