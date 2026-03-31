import React, { useState, useCallback, memo, useEffect } from 'react';
import { Loader2, Check, Save, BookmarkPlus } from 'lucide-react';

const CATEGORIES = [
    'Food',
    'Shopping',
    'Entertainment',
    'Travel',
    'Groceries',
    'Transport',
    'Bills',
    'Recharge',
    'Healthcare',
    'Education',
    'Subscriptions',
    'Investment',
    'Bank Charges',
    'Salary',
    'Transfer',
    'Others'
];

const CATEGORY_COLORS = {
    Food: 'bg-orange-100 text-orange-700',
    Transport: 'bg-sky-100 text-sky-700',
    Groceries: 'bg-green-100 text-green-700',
    Utilities: 'bg-teal-100 text-teal-700',
    Entertainment: 'bg-pink-100 text-pink-700',
    Shopping: 'bg-purple-100 text-purple-700',
    Healthcare: 'bg-rose-100 text-rose-700',
    Education: 'bg-cyan-100 text-cyan-700',
    Salary: 'bg-green-100 text-green-700',
    Transfer: 'bg-blue-100 text-blue-700',
    Subscriptions: 'bg-violet-100 text-violet-700',
    Bills: 'bg-yellow-100 text-yellow-700',
    Recharge: 'bg-indigo-100 text-indigo-700',
    Investment: 'bg-emerald-100 text-emerald-700',
    'Bank Charges': 'bg-gray-200 text-gray-800',
    Travel: 'bg-blue-100 text-blue-700',
    Others: 'bg-gray-100 text-gray-700',
};

const API_BASE_URL = 'http://localhost:8000/api';

const TransactionRow = memo(({ transaction, onCategoryUpdated, showToast }) => {

    const [selectedCategory, setSelectedCategory] = useState("");
    const [originalCategory, setOriginalCategory] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveAsRule, setSaveAsRule] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    /* Sync backend category */
    useEffect(() => {
        const cat = transaction.category || "Others";
        setSelectedCategory(cat);
        setOriginalCategory(cat);
        setHasChanged(false);
    }, [transaction.category]);

    const handleCategoryChange = useCallback((e) => {
        const newVal = e.target.value;
        setSelectedCategory(newVal);
        setHasChanged(newVal !== originalCategory);
        setJustSaved(false);
    }, [originalCategory]);

    const handleSave = useCallback(async () => {

        if (isSaving || !hasChanged) return;

        setIsSaving(true);

        try {

            const res = await fetch(`${API_BASE_URL}/transactions/${transaction.id || transaction._id}/category`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ category: selectedCategory }),
            });

            if (!res.ok) {
                throw new Error("Failed to update category");
            }

            if (saveAsRule) {

                try {

                    await fetch(`${API_BASE_URL}/rules`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            type: 'merchant',
                            value: transaction.merchant,
                            category: selectedCategory,
                        }),
                    });

                } catch {
                    showToast('error', 'Category updated, but rule creation failed.');
                }

            }

            setJustSaved(true);
            setHasChanged(false);
            setSaveAsRule(false);

            showToast('success', `"${transaction.description}" recategorized to ${selectedCategory}`);

            if (onCategoryUpdated) {
                onCategoryUpdated(transaction.id || transaction._id, selectedCategory);
            }

            setTimeout(() => setJustSaved(false), 2500);

        } catch (err) {

            showToast('error', err.message || 'Failed to update category.');

        } finally {
            setIsSaving(false);
        }

    }, [isSaving, hasChanged, selectedCategory, saveAsRule, transaction, showToast, onCategoryUpdated]);

    const IconComponent = transaction.icon;
    const categoryBadgeColor = CATEGORY_COLORS[selectedCategory] || CATEGORY_COLORS.Others;

    return (
        <tr
            className={`transition-all duration-300 group ${
                isSaving
                    ? 'bg-blue-50/50'
                    : justSaved
                    ? 'bg-green-50/50'
                    : 'hover:bg-gray-50/80'
            }`}
        >

            {/* Transaction Name */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        transaction.amount > 0 ? 'bg-green-100' : 'bg-gray-100'
                    } transition-colors`}>
                        {IconComponent && (
                            <IconComponent className={`w-4 h-4 ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-gray-600'
                            }`} />
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-900 text-sm">{transaction.description}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{transaction.posted_date}</p>
                    </div>
                </div>
            </td>

            {/* Category Dropdown */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    <div className="relative">
                        <select
                            id={`category-select-${transaction.id}`}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            disabled={isSaving}
                            className={`w-full min-w-[140px] border rounded-xl px-3 py-2 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                hasChanged
                                    ? 'border-blue-400 ring-2 ring-blue-100'
                                    : 'border-gray-200'
                            }`}
                        >
                            <option value="" disabled>Select category…</option>

                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}

                        </select>

                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {hasChanged && (
                        <label
                            className="flex items-center gap-1.5 cursor-pointer select-none group/rule"
                            style={{ animation: 'fadeSlideUp 0.2s ease-out' }}
                        >
                            <input
                                type="checkbox"
                                checked={saveAsRule}
                                onChange={(e) => setSaveAsRule(e.target.checked)}
                                disabled={isSaving}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-[10px] text-gray-400 group-hover/rule:text-gray-600 transition-colors flex items-center gap-1">
                                <BookmarkPlus className="w-3 h-3" />
                                Save as Rule
                            </span>
                        </label>
                    )}
                </div>
            </td>

            {/* Currency */}
            <td className="px-6 py-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    {transaction.currency}
                </span>
            </td>

            {/* Amount */}
            <td className={`px-6 py-4 text-right font-bold text-sm ${
                transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
            }`}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </td>

            {/* Action */}
            <td className="px-6 py-4 text-right">
                {justSaved ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-green-700 bg-green-100 rounded-xl">
                        <Check className="w-3.5 h-3.5" />
                        Saved
                    </span>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={!hasChanged || isSaving}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                            hasChanged && !isSaving
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                Update
                            </>
                        )}
                    </button>
                )}
            </td>

        </tr>
    );
});

TransactionRow.displayName = 'TransactionRow';

export default TransactionRow;