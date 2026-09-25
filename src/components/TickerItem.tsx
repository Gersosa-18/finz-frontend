import React from "react";
import "./TickerItem.css";

export interface TickerData {
  symbol: string;
  price: number | string;
  change: number;
}

export interface TickerItemProps {
  ticker: TickerData;
  priceChange?: "up" | "down" | null;
}

export const TickerItem: React.FC<TickerItemProps> = React.memo(
  ({ ticker, priceChange = null }) => {
    return (
      <>
        <span className="ticker-symbol">{ticker.symbol}</span>
        <span className={`ticker-price ${priceChange || ""}`}>
          ${ticker.price}
        </span>
        <span
          className={`ticker-change ${
            ticker.change >= 0 ? "positive" : "negative"
          }`}
        >
          {ticker.change >= 0 ? "+" : ""}
          {ticker.change}%
        </span>
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.priceChange === nextProps.priceChange &&
    prevProps.ticker.symbol === nextProps.ticker.symbol &&
    prevProps.ticker.price === nextProps.ticker.price &&
    prevProps.ticker.change === nextProps.ticker.change
);

TickerItem.displayName = "TickerItem";
