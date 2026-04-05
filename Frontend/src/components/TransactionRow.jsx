import React, { useState, useCallback, memo, useEffect } from 'react';
import { 
    Loader2, Check,
    Utensils, ShoppingCart, Car, Film, Wallet, HeartPulse, GraduationCap, Wifi, Banknote
} from 'lucide-react';

const CATEGORIES = [
    'Food','Shopping','Entertainment','Travel','Groceries','Transport',
    'Bills','Recharge','Healthcare','Education','Subscriptions',
    'Investment','Bank Charges','Salary','Transfer','Others'
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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

const TransactionRow = memo(({ transaction, onCategoryUpdated, showToast }) => {

    const [selectedCategory, setSelectedCategory] = useState("");
    const [originalCategory, setOriginalCategory] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveAsRule, setSaveAsRule] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

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
                body: JSON.stringify({ category: selectedCategory }),
            });

            if (!res.ok) throw new Error("Failed to update category");

            if (saveAsRule && transaction.merchant) {
                try {
                    await fetch(`${API_BASE_URL}/rules`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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

            setTimeout(() => setJustSaved(false), 2000);

        } catch (err) {
            showToast('error', err.message || 'Failed to update category.');
        } finally {
            setIsSaving(false);
        }

    }, [isSaving, hasChanged, selectedCategory, saveAsRule, transaction, showToast, onCategoryUpdated]);

    const IconComponent = CATEGORY_ICONS[selectedCategory] || Banknote;

    return (
        <tr>
            <td colSpan="5" className="px-4 py-2">

                {/* 💎 CARD ROW */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border bg-white shadow-sm transition-all duration-300
                    ${isSaving ? 'bg-blue-50 animate-pulse' : ''}
                    ${justSaved ? 'bg-green-50' : ''}
                    hover:shadow-lg hover:-translate-y-1`}>

                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-4">

                        {/* 🔥 ICON */}
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl
                            ${transaction.amount > 0 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600'}`}>
                            
                            <IconComponent className="w-5 h-5" />
                        </div>

                        {/* TEXT */}
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">
                                {transaction.description}
                            </p>
                            <p className="text-xs text-gray-400">
                                {transaction.posted_date}
                            </p>
                        </div>
                    </div>

                    {/* CATEGORY */}
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        disabled={isSaving}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* AMOUNT */}
                    <div className={`font-bold text-sm ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                        {transaction.amount > 0 ? '+' : '-'}₹{Math.abs(transaction.amount)}
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanged || isSaving}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
                        ${isSaving
                            ? 'bg-blue-400 text-white'
                            : justSaved
                            ? 'bg-green-500 text-white'
                            : hasChanged
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                        {isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Update'}
                    </button>

                </div>

            </td>
        </tr>
    );
});

export default TransactionRow;