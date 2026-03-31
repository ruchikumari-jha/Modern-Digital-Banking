
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentTransactions = () => {
    const navigate = useNavigate();
    
    const transactions = [
        { id: 1, name: 'Spotify Premium', date: 'Today, 10:45 AM', type: 'Subscription', amount: -15.00, icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 2, name: 'Salary Received', date: 'Yesterday', type: 'Salary', amount: 4500.00, icon: ArrowDownLeft, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 3, name: 'Grocery Store', date: 'Oct 20, 2023', type: 'Food', amount: -65.40, icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 4, name: 'Electric Bill', date: 'Oct 18, 2023', type: 'Utility', amount: -120.00, icon: ArrowUpRight, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    ];

    const handleExport = () => {
        let userId = "";
        try {
            const token = localStorage.getItem("access_token");
            if (token) userId = JSON.parse(atob(token.split(".")[1])).user_id;
        } catch (e) {}
        window.open(`http://localhost:8000/export/transactions?format=csv&user_id=${userId}`);
    };

    return (
        <div className="bg-white/80 dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-3xl p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:shadow-none transition-all hover:border-amber-300 dark:hover:border-stone-700 hover:shadow-[0_22px_70px_rgba(146,118,84,0.25)] dark:hover:shadow-none h-full flex flex-col backdrop-blur">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-lg">Transactions</h3>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 text-[11px] font-semibold flex items-center gap-1 uppercase tracking-wider transition-colors"
                        title="Export Transactions (CSV)"
                    >
                        <Download className="w-3 h-3" />
                        Export (CSV)
                    </button>
                    <button
                        onClick={() => navigate('/transaction')}
                        className="text-amber-700 dark:text-amber-500 text-[11px] font-semibold hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-1 uppercase tracking-[0.25em] transition-colors"
                    >
                        View all <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {transactions.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm font-medium">
                        No transactions available
                    </div>
                ) : (
                    transactions.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 dark:bg-stone-800/50 hover:bg-amber-100/90 dark:hover:bg-stone-800 border border-amber-100 dark:border-stone-700/50 hover:border-amber-300 dark:hover:border-stone-600 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all
                                    ${t.amount > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}
                                `}
                            >
                                <t.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-stone-900 dark:text-stone-200 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                                    {t.name}
                                </p>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                    {t.date} • {t.type}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p
                                className={`font-semibold ${
                                    t.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-200'
                                }`}
                            >
                                {t.amount > 0 ? '+' : ''}
                                ₹{Math.abs(t.amount).toFixed(2)}
                            </p>
                            <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase">
                                Success
                            </p>
                        </div>
                    </div>
                )))}
            </div>
        </div>
    );
};

export default RecentTransactions;
