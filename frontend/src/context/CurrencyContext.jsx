import React, { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

const currencyRates = {
  USD: { symbol: '$', rate: 1.0, name: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, name: 'EUR (€)' },
  INR: { symbol: '₹', rate: 83.5, name: 'INR (₹)' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const changeCurrency = (code) => {
    if (currencyRates[code]) {
      setCurrency(code);
      setFadeKey(prev => prev + 1); // forces fade animation on re-render
    }
  };

  const formatCurrency = (amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined) return '';
    const numericAmount = Number(amountInUSD);
    const { symbol, rate } = currencyRates[currency];
    const converted = numericAmount * rate;
    return symbol + converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getCurrencySymbol = () => {
    return currencyRates[currency].symbol;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatCurrency, getCurrencySymbol, currencyRates }}>
      <div key={fadeKey} className="currency-fade-wrapper">
        {children}
      </div>
    </CurrencyContext.Provider>
  );
};
