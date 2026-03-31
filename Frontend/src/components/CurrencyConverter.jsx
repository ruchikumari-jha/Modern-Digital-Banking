
import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Euro, CircleDollarSign } from 'lucide-react';

const CurrencyConverter = () => {
    const [rates, setRates] = useState([
        { code: 'USD', symbol: '₹', rate: '83.12', trend: 'up', color: 'text-green-600', bg: 'bg-green-50' },
        { code: 'EUR', symbol: '₹', rate: '90.50', trend: 'down', color: 'text-red-500', bg: 'bg-red-50' },
        { code: 'GBP', symbol: '₹', rate: '105.20', trend: 'up', color: 'text-green-600', bg: 'bg-green-50' }
    ]);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshRates = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setRates(prev => prev.map(r => ({
                ...r,
                rate: (parseFloat(r.rate) + (Math.random() * 0.2 - 0.1)).toFixed(2),
                trend: Math.random() > 0.5 ? 'up' : 'down'
            })));
            setIsRefreshing(false);
        }, 1000);
    };

    return (
        <div className="bg-white/80 dark:bg-stone-900 p-6 rounded-3xl border border-amber-100 dark:border-stone-800 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:shadow-none transition-all hover:border-amber-300 dark:hover:border-stone-700 hover:shadow-[0_22px_70px_rgba(146,118,84,0.25)] dark:hover:shadow-none h-full backdrop-blur">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">Currency Summary</h3>
                <button
                    onClick={refreshRates}
                    className={`p-2 rounded-xl border border-amber-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 hover:border-amber-300 dark:hover:border-stone-600 transition-all ${
                        isRefreshing ? 'animate-spin' : ''
                    }`}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                {rates.map((currency) => (
                    <div
                        key={currency.code}
                        className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 dark:bg-stone-800/50 border border-amber-100 dark:border-stone-700/50 hover:border-amber-300 dark:hover:border-stone-600 hover:bg-amber-100/90 dark:hover:bg-stone-800 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-500 shadow-sm group-hover:shadow-md transition-all">
                                {currency.code === 'USD' && <DollarSign className="w-5 h-5" />}
                                {currency.code === 'EUR' && <Euro className="w-5 h-5" />}
                                {currency.code === 'GBP' && <CircleDollarSign className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-semibold text-stone-900 dark:text-stone-200">
                                    {currency.code}{' '}
                                    <span className="text-stone-500 dark:text-stone-400 font-medium text-xs">/ INR</span>
                                </p>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">Exchange Rate</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-stone-900 dark:text-stone-200 flex items-center justify-end gap-1">
                                ₹{currency.rate}
                            </p>
                            <div
                                className={`flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${
                                    currency.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                                }`}
                            >
                                {currency.trend === 'up' ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {currency.trend === 'up' ? 'Strong' : 'Weak'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-amber-100 dark:border-stone-800">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse"></span>
                    Live market data (simulated) • Updated 1m ago
                </p>
            </div>
        </div>
    );
};

export default CurrencyConverter;
