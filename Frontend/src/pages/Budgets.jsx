import React, { useState } from 'react';
import { Plus, Trash2, Edit2, PieChart, Loader2, Target, DollarSign, AlertCircle } from 'lucide-react';
import { useBudgets, useToast } from '../context/AppContext';
import { useApiCall } from '../hooks/useApiCall';
import AppLayout from '../components/AppLayout';

const Budgets = () => {
    // ── Global state from context ──
    const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
    const { addToast } = useToast();

    const [editingId, setEditingId] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('Oct');
    const [selectedYear, setSelectedYear] = useState('2023');
    const [formData, setFormData] = useState({ category: 'Food', limit: '' });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const years = ['2023', '2024', '2025'];
    const categories = ['Subscription', 'Salary', 'Food', 'Utility', 'Income', 'Shopping', 'Travel', 'Transfer'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Mock API functions ──
    const mockSaveBudget = async ({ editingId, formData, selectedMonth, selectedYear }) => {
        // Simulate network latency
        await new Promise(r => setTimeout(r, 700));
        // Uncomment to test error handling:
        // throw Object.assign(new Error('Server error'), { status: 500 });
        if (editingId) {
            const existing = budgets.find(b => b.id === editingId);
            updateBudget({
                id: editingId,
                limit: parseFloat(formData.limit),
                percentage: existing ? Math.round((existing.spent / parseFloat(formData.limit)) * 100) : 0
            });
            return 'updated';
        } else {
            addBudget({
                id: Date.now(),
                category: formData.category,
                limit: parseFloat(formData.limit),
                spent: 0,
                percentage: 0,
                month: selectedMonth,
                year: selectedYear
            });
            return 'created';
        }
    };

    const { execute: saveBudget, loading } = useApiCall(mockSaveBudget, {
        successTitle: editingId ? 'Budget Updated' : 'Budget Created',
        successMsg: editingId ? 'Your budget limit has been updated.' : 'New budget has been added.',
    });

    const validateForm = () => {
        if (!formData.limit || isNaN(formData.limit) || parseFloat(formData.limit) <= 0) {
            addToast({ type: 'warning', title: 'Validation Error', message: 'Please enter a valid numeric limit greater than 0.' });
            return false;
        }
        const isDuplicate = budgets.some(b =>
            b.category === formData.category &&
            b.month === selectedMonth &&
            b.year === selectedYear &&
            b.id !== editingId
        );
        if (isDuplicate) {
            addToast({ type: 'warning', title: 'Duplicate Budget', message: `A budget for ${formData.category} already exists for ${selectedMonth} ${selectedYear}.` });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const { ok } = await saveBudget({ editingId, formData, selectedMonth, selectedYear });
        if (ok) {
            setFormData({ category: 'Food', limit: '' });
            setEditingId(null);
        }
    };

    const handleEdit = (budget) => {
        setEditingId(budget.id);
        setFormData({
            category: budget.category,
            limit: budget.limit
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this budget?')) return;
        deleteBudget(id);
        addToast({ type: 'success', title: 'Budget Removed', message: 'The budget entry has been deleted.' });
    };

    const getProgressColor = (percentage) => {
        if (percentage < 70) return 'bg-green-500';
        if (percentage <= 100) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const filteredBudgets = budgets.filter(b => b.month === selectedMonth && b.year === selectedYear);

    return (
        <AppLayout
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-200 dark:border-stone-800">
                        <PieChart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <span>Budget Planner</span>
                </div>
            }
            description="Set limits and visualize your spending progress."
            actions={
                <div className="flex items-center gap-2 bg-white dark:bg-stone-900 overflow-hidden rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 transition-colors duration-300">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent border-none py-2.5 text-xs font-black text-stone-600 dark:text-stone-300 focus:ring-0 cursor-pointer px-3"
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="w-px h-4 bg-stone-100 dark:bg-stone-800"></div>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-transparent border-none py-2.5 text-xs font-black text-stone-600 dark:text-stone-300 focus:ring-0 cursor-pointer px-3"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    {/* Form Card */}
                    <div className="h-full group">
                        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 p-8 h-full flex flex-col hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-300">
                            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
                                {editingId ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
                                {editingId ? 'Edit Budget' : 'Set New Budget'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2 ml-1">Category</label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        disabled={!!editingId}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 dark:text-stone-300 focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-50"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2 ml-1">Monthly Limit (₹)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 dark:text-stone-600" />
                                        <input 
                                            type="number"
                                            name="limit"
                                            placeholder="0.00"
                                            value={formData.limit}
                                            onChange={handleInputChange}
                                            className="w-full bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-stone-700 dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-600 focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>



                                <div className="flex gap-2 mt-auto pt-4">
                                    {editingId && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setEditingId(null);
                                                setFormData({ category: 'Food', limit: '' });
                                            }}
                                            className="flex-1 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-black py-4 rounded-2xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-all text-sm"
                                        >
                                            CANCEL
                                        </button>
                                    )}
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-stone-900 dark:bg-amber-500 text-white font-black py-4 rounded-2xl hover:bg-stone-800 dark:hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-black/5 dark:shadow-amber-500/20 text-sm"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'UPDATE' : 'ADD BUDGET')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Budget Cards */}
                    {filteredBudgets.map((budget) => (
                        <div key={budget.id} className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden h-full">
                            {/* Top Subtle Progress Background */}
                            <div 
                                className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${getProgressColor(budget.percentage)}`}
                                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                            ></div>

                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(budget)} className="p-2 text-stone-400 dark:text-stone-500 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(budget.id)} className="p-2 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>

                            <h3 className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">{budget.category}</h3>
                            
                            <div className="w-20 h-20 rounded-[2rem] bg-stone-50 dark:bg-stone-950 flex items-center justify-center border border-stone-100 dark:border-stone-800 group-hover:scale-110 transition-transform duration-500 mb-6 group-hover:bg-white dark:group-hover:bg-stone-900 group-hover:shadow-lg group-hover:shadow-stone-100 dark:group-hover:shadow-black/20 group-hover:border-amber-200 dark:group-hover:border-amber-500/50">
                                <TagIcon category={budget.category} size="text-3xl" />
                            </div>

                            <div className="space-y-1 mb-6">
                                <p className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">₹{budget.spent.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">of ₹{budget.limit.toLocaleString()}</p>
                            </div>

                            <div className="w-full space-y-3 mt-auto">
                                <div className="flex justify-between items-center px-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${budget.percentage > 100 ? 'text-red-500 dark:text-red-400' : 'text-stone-400 dark:text-stone-500'}`}>
                                        {budget.percentage}% Used
                                    </span>
                                    {budget.percentage > 100 && <AlertCircle className="w-3 h-3 text-red-500 dark:text-red-400 animate-pulse" />}
                                </div>
                                <div className="h-2 w-full bg-stone-50 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-100/50 dark:border-stone-700/50">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out ${getProgressColor(budget.percentage)}`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                {filteredBudgets.length > 0 && (
                    <div className="bg-stone-900 border border-stone-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/10 dark:shadow-none relative overflow-hidden group mb-10 transition-colors duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-black tracking-tight mb-2">Monthly Overview</h3>
                                <p className="text-xs text-stone-400 font-medium">Tracking {filteredBudgets.length} budget categories for {selectedMonth}.</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">Total Limit</p>
                                    <p className="text-2xl font-black text-white">₹{filteredBudgets.reduce((acc, b) => acc + b.limit, 0).toLocaleString()}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">Total Spent</p>
                                    <p className="text-2xl font-black text-amber-500">₹{filteredBudgets.reduce((acc, b) => acc + b.spent, 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </AppLayout>

    );
};

// Helper component for icons
const TagIcon = ({ category, size = 'text-xl' }) => {
    switch (category) {
        case 'Food': return <p className={size}>🍕</p>;
        case 'Subscription': return <p className={size}>📱</p>;
        case 'Travel': return <p className={size}>✈️</p>;
        case 'Salary': return <p className={size}>💰</p>;
        case 'Utility': return <p className={size}>⚡</p>;
        case 'Shopping': return <p className={size}>🛍️</p>;
        case 'Income': return <p className={size}>📈</p>;
        case 'Transfer': return <p className={size}>🔄</p>;
        case 'Fuel': return <p className={size}>⛽</p>;
        case 'Groceries': return <p className={size}>🛒</p>;
        case 'Health': return <p className={size}>🩺</p>;
        default: return <PieChart className="w-6 h-6" />;
    }
};

export default Budgets;
