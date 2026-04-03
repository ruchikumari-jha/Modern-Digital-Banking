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

const API_BASE_URL = 'http://localhost:8000';

const TransactionRow = memo(({ transaction, onCategoryUpdated, showToast }) => {

    const [selectedCategory, setSelectedCategory] = useState("");
    const [originalCategory, setOriginalCategory] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveAsRule, setSaveAsRule] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    // ✅ Sync backend category
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

            const txnId = transaction.id || transaction._id;

            const res = await fetch(`${API_BASE_URL}/transactions/${txnId}/category`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ category: selectedCategory }),
            });

            if (!res.ok) {
                throw new Error("Failed to update category");
            }

            // ✅ Optional rule creation
            if (saveAsRule && transaction.merchant) {
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

            showToast('success', `"${transaction.description}" → ${selectedCategory}`);

            if (onCategoryUpdated) {
                onCategoryUpdated(txnId, selectedCategory);
            }

            setTimeout(() => setJustSaved(false), 2500);

        } catch (err) {
            showToast('error', err.message || 'Failed to update category.');
        } finally {
            setIsSaving(false);
        }

    }, [isSaving, hasChanged, selectedCategory, saveAsRule, transaction, showToast, onCategoryUpdated]);

    const IconComponent = transaction.icon;

    return (
        <tr className={`transition-all duration-300 ${
            isSaving ? 'bg-blue-50/50'
            : justSaved ? 'bg-green-50/50'
            : 'hover:bg-gray-50/80'
        }`}>

            {/* Name */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        transaction.amount > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                        {IconComponent && (
                            <IconComponent className={`w-4 h-4 ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-gray-600'
                            }`} />
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-sm">{transaction.description}</span>
                        <p className="text-xs text-gray-400">{transaction.posted_date}</p>
                    </div>
                </div>
            </td>

            {/* Category */}
            <td className="px-6 py-4">
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={isSaving}
                    className="border rounded-xl px-3 py-2 text-xs"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </td>

            {/* Currency */}
            <td className="px-6 py-4">
                {transaction.currency}
            </td>

            {/* Amount */}
            <td className="px-6 py-4 text-right font-bold">
                {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
            </td>

            {/* Action */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={handleSave}
                    disabled={!hasChanged || isSaving}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                    {isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Update'}
                </button>
            </td>

        </tr>
    );
});

export default TransactionRow;