import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, 
    Utensils, ShoppingCart, Car, Film, Wallet, HeartPulse, GraduationCap, Wifi, Banknote } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const MONTHS = ['All', 'Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr', 'Mar', 'Feb', 'Jan'];
const PAGE_SIZE = 8;
const API_BASE_URL = 'http://localhost:8000';

const CATEGORY_ICONS = {
    Food: Utensils,
    Shopping: ShoppingCart,
    Transport: Car,
    Travel: Car,
    Entertainment: Film,
    Salary: Wallet,
    Investment: Banknote,
    Healthcare: HeartPulse,
    Education: GraduationCap,
    Recharge: Wifi,
    Bills: Banknote,
    Transfer: Banknote,
    Groceries: ShoppingCart,
    Subscriptions: Film,
    'Bank Charges': Banknote,
    Others: Banknote
};

const Transaction = () => {

    const [selectedMonth, setSelectedMonth] = useState('All');
    const [activeMonth, setActiveMonth] = useState('All');
    const debounceRef = useRef(null);

    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleMonthClick = useCallback((month) => {
        setSelectedMonth(month);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setActiveMonth(month);
            setPage(1);
        }, 200);
    }, []);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const fetchTransactions = async () => {
        try {
            const accountId = Number(localStorage.getItem("accountID") || 1);

            const res = await fetch(
                `${API_BASE_URL}/transactions?account_id=${accountId}&page=${page}&limit=${PAGE_SIZE}`
            );

            const data = await res.json();

            setTransactions(data.transactions || []);
            setTotalPages(data.totalPages || 1);

        } catch (err) {
            console.error("Error:", err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const processedTransactions = useMemo(() => {
        return transactions.map(t => {
            const date = new Date(t.txn_date);
            const month = date.toLocaleString('default', { month: 'short' });

            return {
                ...t,
                month,
                name: t.description,
                date: new Date(t.txn_date).toLocaleString(),
                type: t.category || "Others",
                amount: t.txn_type === "credit" ? t.amount : -t.amount,
            };
        });
    }, [transactions]);

    const filteredTransactions = useMemo(() =>
        activeMonth === 'All'
            ? processedTransactions
            : processedTransactions.filter(t => t.month === activeMonth),
        [processedTransactions, activeMonth]
    );

    const paginatedTransactions = filteredTransactions;

    const monthIncome = useMemo(() =>
        filteredTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0),
        [filteredTransactions]
    );

    const monthExpense = useMemo(() =>
        filteredTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0),
        [filteredTransactions]
    );

    const handleExport = () => {
        window.open(`${API_BASE_URL}/export/transactions?format=csv`);
    };

    return (
        <AppLayout
            title="Payment History"
            description="Easily recategorize and track your spending habits."
            actions={
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-[#eab308] text-white shadow hover:opacity-90"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            }
        >
            <div className="bg-[#f6f1e7] rounded-3xl border border-[#e6d3a3] overflow-hidden mb-10">

                {/* Month Selector */}
                <div className="p-6 border-b border-[#e6d3a3]">
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                        {MONTHS.map(month => (
                            <button
                                key={month}
                                onClick={() => handleMonthClick(month)}
                                className={`px-3 py-3 rounded-2xl text-[11px] font-bold transition
                                    ${selectedMonth === month
                                        ? 'bg-[#eab308] text-white'
                                        : 'bg-[#ede5d8] text-[#7a6a58]'
                                    }`}
                            >
                                {month}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="p-6 border-b border-[#e6d3a3]">
                    <div className="grid grid-cols-2 gap-4">

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#ede5d8]">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#d6f5e8]">💰</div>
                            <div>
                                <p className="text-xs text-[#7a6a58]">Money In</p>
                                <p className="text-xl font-bold text-emerald-600">+₹{monthIncome}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#ede5d8]">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#fde2e2]">💸</div>
                            <div>
                                <p className="text-xs text-[#7a6a58]">Money Out</p>
                                <p className="text-xl font-bold text-[#b91c1c]">-₹{monthExpense}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Transactions */}
                <div className="p-4 space-y-3">

                    {paginatedTransactions.map((t) => {
                        const Icon = CATEGORY_ICONS[t.type] || Banknote;

                        return (
                            <div
                                key={t.id}
                                className="flex items-center justify-between p-4 rounded-2xl border border-[#e6d3a3] bg-[#f3ede3] hover:bg-[#efe6d6] transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#e5e7eb] text-gray-600">
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-sm text-[#3b2f2f]">{t.name}</h4>
                                        <p className="text-xs text-[#7a6a58]">{t.date}</p>
                                        <p className="text-xs text-[#9a8b7a]">{t.type}</p>
                                    </div>
                                </div>

                                <div className={`font-bold ${
                                    t.amount > 0 ? 'text-emerald-600' : 'text-[#3b2f2f]'
                                }`}>
                                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount)}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    <div className="flex justify-between mt-6 items-center">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))}>
                            <ChevronLeft />
                        </button>

                        <span className="text-sm text-[#7a6a58]">
                            Page {page} / {totalPages}
                        </span>

                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                            <ChevronRight />
                        </button>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
};

export default Transaction;