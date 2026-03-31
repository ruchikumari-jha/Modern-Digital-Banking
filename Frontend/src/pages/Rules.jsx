import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { Plus, Trash2, List, Loader2, ShieldCheck, Tag, AlertCircle } from 'lucide-react';
import { useToast } from '../context/AppContext';
import { useApiCall } from '../hooks/useApiCall';

const Rules = () => {
    const { addToast } = useToast();

    const [rules, setRules] = useState(() => {
        const savedRules = localStorage.getItem('banking_rules');
        return savedRules ? JSON.parse(savedRules) : [
            { id: 1, type: 'Merchant', value: 'Spotify', category: 'Subscription' },
            { id: 2, type: 'Keyword', value: 'Salary', category: 'Salary' },
            { id: 3, type: 'Merchant', value: 'Zomato', category: 'Food' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('banking_rules', JSON.stringify(rules));
    }, [rules]);

    const [formData, setFormData] = useState({ type: 'Merchant', value: '', category: 'Food' });
    const categories = ['Subscription', 'Salary', 'Food', 'Utility', 'Income', 'Shopping', 'Travel', 'Transfer'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Mock API ──
    const mockCreateRule = async (formData) => {
        await new Promise(r => setTimeout(r, 700));
        // throw Object.assign(new Error('Server error'), { status: 500 }); // test error
        const newRule = { id: Date.now(), ...formData };
        setRules(prev => [newRule, ...prev]);
    };
    const mockDeleteRule = async (id) => {
        await new Promise(r => setTimeout(r, 500));
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const { execute: createRule, loading: creating } = useApiCall(mockCreateRule, {
        successTitle: 'Rule Created',
        successMsg: 'Categorization rule has been saved.',
    });
    const { execute: deleteRule, loading: deleting } = useApiCall(mockDeleteRule, {
        successTitle: 'Rule Deleted',
        successMsg: 'Rule has been removed.',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.value.trim()) {
            addToast({ type: 'warning', title: 'Validation Error', message: 'Rule value cannot be empty.' });
            return;
        }
        if (rules.some(r => r.type === formData.type && r.value.toLowerCase() === formData.value.toLowerCase())) {
            addToast({ type: 'warning', title: 'Duplicate Rule', message: 'This rule already exists.' });
            return;
        }
        const { ok } = await createRule(formData);
        if (ok) setFormData({ type: 'Merchant', value: '', category: 'Food' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this rule?')) return;
        await deleteRule(id);
    };

    return (
        <AppLayout title="Smart Categorization" description="Automate your finances by creating custom categorization rules.">
            <div className="max-w-5xl mx-auto w-full">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Rule Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 p-8 sticky top-8 transition-colors">
                            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-amber-500" />
                                New Rule
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Rule Type</label>
                                    <select 
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-50 dark:bg-stone-800 border-[1.5px] border-stone-100 dark:border-stone-700 rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 dark:text-stone-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-all"
                                    >
                                        <option value="Merchant">Merchant Name</option>
                                        <option value="Keyword">Keyword Match</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Pattern Value</label>
                                    <input 
                                        type="text"
                                        name="value"
                                        placeholder="e.g. Netflix or Uber"
                                        value={formData.value}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-50 dark:bg-stone-800 border-[1.5px] border-stone-100 dark:border-stone-700 rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-500 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Assign Category</label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-50 dark:bg-stone-800 border-[1.5px] border-stone-100 dark:border-stone-700 rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 dark:text-stone-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-all"
                                    >
                                        {categories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-stone-900 text-white font-black py-4 rounded-2xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-black/5"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CREATE RULE'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Rules List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden transition-colors">
                            <div className="p-8 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
                                <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                    <List className="w-5 h-5 text-amber-500" />
                                    Active Rules
                                </h2>
                                <span className="bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {rules.length} total
                                </span>
                            </div>

                            <div className="divide-y divide-stone-50 dark:divide-stone-800/50">
                                {rules.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Tag className="w-8 h-8 text-stone-200" />
                                        </div>
                                        <p className="text-stone-400 font-bold">No rules found. Create your first one!</p>
                                    </div>
                                ) : (
                                    rules.map((rule) => (
                                        <div key={rule.id} className="p-6 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 text-stone-400 dark:text-stone-500 font-black text-xs`}>
                                                    {rule.type[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-stone-900 dark:text-stone-100">{rule.value}</h4>
                                                        <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase">
                                                            {rule.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-stone-400 text-xs font-bold mt-1 uppercase tracking-wider">
                                                        Maps to: <span className="text-amber-500">{rule.category}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(rule.id)}
                                                className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Tip Section */}
                        <div className="mt-8 p-6 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/30 rounded-[2rem] flex gap-4 transition-colors">
                            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black text-amber-900 dark:text-amber-500 tracking-tight">How it works</h4>
                                <p className="text-[11px] text-amber-700/60 dark:text-amber-500/60 font-bold leading-relaxed mt-1">
                                    Rules are applied automatically to new transactions. "Merchant" rules match the exact name, while "Keyword" rules search for text snippets within transaction descriptions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Rules;
