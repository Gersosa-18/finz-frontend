import React from "react";
import "./TickerItem.css";

export const TickerItem = ({
  ticker,
  priceChange = null,
}: {
  ticker: any,
  priceChange?: "up" | "down" | null,
}) => {
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
};
