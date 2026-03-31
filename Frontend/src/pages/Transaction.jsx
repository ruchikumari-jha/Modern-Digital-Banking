import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ArrowUpRight, Coffee, ShoppingCart, Zap, Briefcase, Music, Smartphone, Landmark, Save, Check, Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import AppLayout from '../components/AppLayout';

// ── Data defined outside component to avoid re-creation on every render ──
const ALL_TRANSACTIONS_DATA = [
    { id: 1, month: 'Oct', name: 'Spotify Premium', date: 'Oct 23, 10:45 AM', type: 'Subscription', amount: -15.00, icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const MONTHS = ['All', 'Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr', 'Mar', 'Feb', 'Jan'];
const CATEGORIES = ['Subscription', 'Salary', 'Food', 'Utility', 'Income', 'Shopping', 'Travel', 'Transfer'];
const PAGE_SIZE = 8;


const Transaction = () => {
    const [selectedMonth, setSelectedMonth] = useState('Oct');
    // Debounce: we apply the filter 200ms after the user stops clicking
    const [activeMonth, setActiveMonth] = useState('Oct');
    const debounceRef = useRef(null);

    const handleMonthClick = useCallback((month) => {
        setSelectedMonth(month); // instant visual feedback
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setActiveMonth(month), 200);
    }, []);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const [transactions, setTransactions] = useState(ALL_TRANSACTIONS_DATA);
    const [updatingId, setUpdatingId] = useState(null);
    const [successId, setSuccessId] = useState(null);
    const [page, setPage] = useState(1);

    // Reset to page 1 when month changes
    useEffect(() => { setPage(1); }, [activeMonth]);

    const handleUpdateCategory = useCallback((id, newCategory) => {
        setUpdatingId(id);
        setTimeout(() => {
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, type: newCategory } : t));
            setUpdatingId(null);
            setSuccessId(id);
            setTimeout(() => setSuccessId(null), 3000);
        }, 800);
    }, []);

    // ── Memoized derived data ──
    const filteredTransactions = useMemo(() =>
        activeMonth === 'All'
            ? transactions
            : transactions.filter(t => t.month === activeMonth),
        [transactions, activeMonth]
    );

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
    const paginatedTransactions = useMemo(() =>
        filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [filteredTransactions, page]
    );

    const monthIncome = useMemo(() =>
        filteredTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0),
        [filteredTransactions]
    );
    const monthExpense = useMemo(() =>
        filteredTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0),
        [filteredTransactions]
    );

    const handleExport = () => {
        let userId = "";
        try {
            const token = localStorage.getItem("access_token");
            if (token) userId = JSON.parse(atob(token.split(".")[1])).user_id;
        } catch (e) {}
        window.open(`http://localhost:8000/export/transactions?format=csv&user_id=${userId}`);
    };

    return (
        <AppLayout
            title="Payment History"
            description="Easily recategorize and track your spending habits."
            actions={
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400 transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export Transactions (CSV)
                </button>
            }
        >
                <div className="bg-white dark:bg-stone-900/50 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-800 overflow-hidden mb-10 transition-colors duration-300">
                    
                    {/* Month Selector */}
                    <div className="border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 transition-colors duration-300">
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                            {MONTHS.map(month => (
                                <button
                                    key={month}
                                    onClick={() => handleMonthClick(month)}
                                    className={`px-3 py-3 rounded-2xl text-[11px] font-black transition-all duration-300 transform active:scale-95 uppercase tracking-wider ${
                                        selectedMonth === month 
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                        : 'bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-100 dark:border-stone-800'
                                    }`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simple summary for the month */}
                    <div className="bg-stone-50/50 dark:bg-stone-900/30 p-6 flex justify-around items-center border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
                        <div className="text-center">
                            <p className="text-stone-400 dark:text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Money In</p>
                            <p className="text-xl font-black text-green-600 dark:text-green-500 tracking-tight">+₹{monthIncome.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-8 bg-stone-200 dark:bg-stone-700"></div>
                        <div className="text-center">
                            <p className="text-stone-400 dark:text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Money Out</p>
                            <p className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight">-₹{monthExpense.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Transaction List (Mobile App style, horizontal rows) */}
                    <div className="p-2 sm:p-4">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 px-4 pt-2 pb-4 uppercase tracking-wider">
                            {selectedMonth}
                        </h3>

                        {filteredTransactions.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 font-medium">
                                <p>No transactions available</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {paginatedTransactions.map((t) => (
                                    <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-stone-50 dark:hover:bg-stone-900/50 rounded-[2.5rem] transition-all border border-transparent hover:border-stone-100 dark:hover:border-stone-800 group">
                                        <div className="flex items-center gap-5 flex-1">
                                            {/* App-like Icon Box */}
                                            <div className={`w-14 h-14 rounded-[1.75rem] flex items-center justify-center ${t.bg} text-opacity-90 shadow-sm border border-stone-100/50 group-hover:scale-105 transition-transform shrink-0`}>
                                                <t.icon className={`w-7 h-7 ${t.color}`} />
                                            </div>
                                            {/* Primary details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-stone-900 dark:text-stone-100 text-lg truncate tracking-tight">{t.name}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-stone-400 text-xs font-bold">{t.date}</span>
                                                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                                    <span className="text-stone-500 text-xs font-bold">{t.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Amount */}
                                        <div className="text-right mt-4 sm:mt-0 pl-19 sm:pl-0">
                                            <p className={`font-black text-xl tracking-tighter ${t.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-stone-900 dark:text-stone-100'}`}>
                                                {t.amount > 0 ? '+' : ''}{t.amount < 0 ? '-' : ''}₹{Math.abs(t.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-5 border-t border-stone-50 mt-3">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                    Page {page} of {totalPages} &nbsp;·&nbsp; {filteredTransactions.length} transactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-xl border border-stone-100 hover:bg-stone-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-stone-500" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all ${
                                                page === n
                                                    ? 'bg-amber-500 text-white shadow-sm'
                                                    : 'border border-stone-100 text-stone-400 hover:bg-stone-50'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-xl border border-stone-100 hover:bg-stone-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4 text-stone-500" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
        </AppLayout>
    );
};

export default Transaction;
