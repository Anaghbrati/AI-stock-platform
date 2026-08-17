
"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { StockSearchResult } from "../types/search";

const DEBOUNCE_MS = 300;

/*
 * Default stocks shown when the user
 * clicks the search box without typing.
 */
const DEFAULT_SUGGESTIONS: StockSearchResult[] = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    exchange: "NSE",
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services Limited",
    exchange: "NSE",
  },
  {
    symbol: "INFY.NS",
    name: "Infosys Limited",
    exchange: "NSE",
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    exchange: "NSE",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
  },
];

export default function StockSearch() {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] =
    useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] =
    useState(false);
  const [isOpen, setIsOpen] =
    useState(false);
  const [selectedIndex, setSelectedIndex] =
    useState(-1);
  const [error, setError] =
    useState<string | null>(null);

  /*
   * SEARCH API
   *
   * Only call the API when the user
   * actually types something.
   */
  useEffect(() => {
    const trimmedQuery = query.trim();

    /*
     * Empty search:
     * show default suggestions.
     */
    if (!trimmedQuery) {
      setResults(DEFAULT_SUGGESTIONS);
      setSelectedIndex(-1);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSelectedIndex(-1);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(
            trimmedQuery
          )}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ?? "Search failed"
          );
        }

        setResults(data.results ?? []);
        setIsOpen(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Search request failed:",
          error
        );

        setResults([]);
        setError("Unable to search stocks");
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  /*
   * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * SELECT STOCK
   */
  function selectStock(
    stock: StockSearchResult
  ) {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);

    router.push(
      `/stock/${encodeURIComponent(
        stock.symbol
      )}`
    );
  }

  /*
   * KEYBOARD NAVIGATION
   */
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      !isOpen ||
      results.length === 0
    ) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setSelectedIndex((current) =>
          current < results.length - 1
            ? current + 1
            : 0
        );

        break;

      case "ArrowUp":
        event.preventDefault();

        setSelectedIndex((current) =>
          current > 0
            ? current - 1
            : results.length - 1
        );

        break;

      case "Enter":
        event.preventDefault();

        if (selectedIndex >= 0) {
          selectStock(
            results[selectedIndex]
          );
        }

        break;

      case "Escape":
        event.preventDefault();

        setIsOpen(false);
        setSelectedIndex(-1);

        break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl"
    >
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            /*
             * When search is clicked with
             * no text, show default stocks.
             */
            if (!query.trim()) {
              setResults(
                DEFAULT_SUGGESTIONS
              );
            }

            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks..."
          aria-label="Search stocks"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="h-10 w-full rounded-lg border bg-background pl-10 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-primary"
        />

        {isLoading && (
          <Loader2
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      
        {isOpen && (
          <div
            className="
              absolute
              left-0
              right-0
              top-full
              z-50
              mt-2
              overflow-hidden
              rounded-lg
              border
              border-[#252a36]
              bg-[#0b0f14]
              shadow-2xl
            "
          >
            {error && (
              <div className="p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {!error &&
              !isLoading &&
              results.length === 0 && (
                <div className="p-4 text-sm text-gray-400">
                  No stocks found.
                </div>
              )}

            {!error &&
              results.length > 0 && (
                <div
                  role="listbox"
                  aria-label="Stock search results"
                  className="max-h-96 overflow-y-auto py-1"
                >
                  {results.map((stock, index) => {
                    const isSelected =
                      index === selectedIndex;

                    return (
                      <button
                        key={`${stock.symbol}-${stock.exchange}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onClick={() => selectStock(stock)}
                        onMouseEnter={() =>
                          setSelectedIndex(index)
                        }
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-4
                          px-4
                          py-3
                          text-left
                          transition
                          ${
                            isSelected
                              ? "bg-[#171c25]"
                              : "hover:bg-[#151a22]"
                          }
                        `}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white">
                            {stock.symbol}
                          </div>

                          <div className="truncate text-sm text-gray-400">
                            {stock.name}
                          </div>
                        </div>

                        <div className="shrink-0 text-xs text-gray-400">
                          {stock.exchange}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        )}


    </div>
  );
}
