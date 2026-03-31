
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { useBudgets, useUser } from '../context/AppContext';

const BASE_URL = "http://localhost:8000";

const PALETTE = [
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#6366F1', // Indigo
];

function getUserIdFromToken() {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id ?? null;
    } catch {
        return null;
    }
}

const BudgetProgress = () => {
    const { budgets } = useBudgets();
    const { authLoading } = useUser();

    // Map global budgets to the format needed by the widget
    const data = React.useMemo(() => {
        if (!budgets || budgets.length === 0) return [];
        return budgets.map((b, index) => ({
            name: b.category,
            value: b.spent_amount || 0,
            total: b.limit_amount || 1, // Avoid division by zero
            color: PALETTE[index % PALETTE.length]
        }));
    }, [budgets]);

    const totalSpent = data.reduce((sum, item) => sum + item.value, 0);
    const totalLimit = data.reduce((sum, item) => sum + item.total, 0);
    const totalHealth = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-stone-800 transition-colors hover:shadow-md h-full duration-300">
            <h3 className="font-bold text-gray-800 dark:text-stone-100 text-lg mb-6">Budget Progress</h3>
            
            {authLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-xs font-bold text-stone-400">Syncing budgets...</p>
                </div>
            ) : false ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-400">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-xs font-bold text-center">{error}</p>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-400">
                    <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center border border-stone-100 dark:border-stone-700">
                        <PieChart className="w-6 h-6 text-stone-200 dark:text-stone-600" />
                    </div>
                    <p className="text-xs font-bold">No active budgets found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((item) => {
                        const percentage = Math.round((item.value / item.total) * 100);
                        const isOver = percentage >= 100;

                        return (
                            <div key={item.name} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-stone-100 capitalize">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                                            ₹{item.value.toLocaleString()} / ₹{item.total.toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-black ${isOver ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${Math.min(percentage, 100)}%`, 
                                            backgroundColor: isOver ? '#EF4444' : item.color 
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 flex items-center justify-between transition-colors duration-300">
                        <div>
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Overall Status</p>
                            <p className="text-sm text-amber-600 dark:text-amber-300">
                                {totalHealth >= 100 ? 'Budget exceeded' : totalHealth >= 80 ? 'Near limit' : 'On track for savings'}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full border-4 ${totalHealth >= 100 ? 'border-red-200 dark:border-red-500/30 border-t-red-600' : 'border-amber-200 dark:border-amber-500/30 border-t-amber-600'} flex items-center justify-center`}>
                            <span className="text-[10px] font-black text-amber-900 dark:text-amber-400">{totalHealth}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetProgress;

