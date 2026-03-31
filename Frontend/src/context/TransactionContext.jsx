import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from './ToastContext';

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

const API_BASE_URL = 'http://localhost:8000';
const REQUEST_TIMEOUT = 8000;

export const TransactionProvider = ({ children }) => {

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorType, setErrorType] = useState('general');
    const { showToast } = useToast();

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [globalStats, setGlobalStats] = useState({ total: 0, income: 0, expense: 0 });

    const lastFetchParams = useRef(null);

    const fetchTransactions = useCallback(async (page = 1, limit = 10, search = '', category = 'All') => {

        setLoading(true);
        setError(null);
        setErrorType('general');

        lastFetchParams.current = { page, limit, search, category };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {

            const accountId = Number(localStorage.getItem("accountID"));

            const params = new URLSearchParams({
                account_id: accountId,
                page: String(page),
                limit: String(limit)
            });

            if (search) params.append('search', search);
            if (category !== 'All') params.append('category', category);

            const res = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.status === 401) {
                setErrorType('auth');
                throw new Error("Your session has expired. Please log in again.");
            }

            if (res.status >= 500) {
                setErrorType('server');
                throw new Error("Server unavailable. Please try again later.");
            }

            if (!res.ok) {
                throw new Error(`Unexpected error (${res.status})`);
            }

            const data = await res.json();

            let txns = [];

            if (Array.isArray(data)) {

                txns = data;

                setPagination(prev => ({
                    ...prev,
                    total: data.length,
                    totalPages: Math.ceil(data.length / limit)
                }));

            } else {

                txns = data.transactions || [];

                setPagination({
                    page: data.currentPage || page,
                    limit: data.limit || limit,
                    total: data.totalTransactions || 0,
                    totalPages: data.totalPages || 0
                });

                if (data.stats) {
                    setGlobalStats(data.stats);
                }
            }

            setTransactions(txns);

            const stats = txns.reduce((acc, txn) => {

                const amount = Number(txn.amount) || 0;

                acc.total += amount;

                if (txn.txn_type === "credit") {
                    acc.income += amount;
                }

                if (txn.txn_type === "debit") {
                    acc.expense += amount;
                }

                return acc;

            }, { total: 0, income: 0, expense: 0 });

            setGlobalStats(stats);

        } catch (err) {

            if (err.name === 'AbortError') {

                setError("Request timeout. Please check your internet connection.");
                setErrorType('network');

                showToast('error', 'Network timeout');

            } else {

                setError(err.message);

                if (err.message.includes('fetch')) {
                    setErrorType('network');
                }

                console.error('Transaction fetch error:', err);
            }

        } finally {

            setLoading(false);

        }

    }, [showToast]);


    const handleRetry = useCallback(() => {

        if (lastFetchParams.current) {

            const { page, limit, search, category } = lastFetchParams.current;

            fetchTransactions(page, limit, search, category);

        }

    }, [fetchTransactions]);


    const addTransaction = async (txnData) => {

        try {

            const res = await fetch(`${API_BASE_URL}/transactions`, {

                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(txnData),

            });

            if (res.status === 400) {

                const errData = await res.json();
                throw new Error(errData.message || "Invalid transaction");

            }

            if (!res.ok) {
                throw new Error("Failed to add transaction");
            }

            showToast('success', 'Transaction added successfully');

            await fetchTransactions(pagination.page, pagination.limit);

            return { success: true };

        } catch (err) {

            showToast('error', err.message);

            return { success: false, error: err.message };

        }

    };


    const updateTransactionCategory = async (id, category) => {

        try {

            const res = await fetch(`${API_BASE_URL}/transactions/${id}/category`, {

                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ category }),

            });

            if (!res.ok) {
                throw new Error("Failed to update category");
            }

            setTransactions(prev =>
                prev.map(t =>
                    (t.id === id || t._id === id) ? { ...t, category } : t
                )
            );

            return { success: true };

        } catch (err) {

            showToast('error', err.message);

            return { success: false, error: err.message };

        }

    };


    const chartData = useMemo(() => {

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const data = days.map(day => ({
            name: day,
            income: 0,
            expense: 0
        }));

        transactions.forEach(t => {

            const date = new Date(t.date || Date.now());

            const dayIndex = date.getDay();

            if (t.txn_type === "credit") {
                data[dayIndex].income += Number(t.amount) || 0;
            }

            if (t.txn_type === "debit") {
                data[dayIndex].expense += Number(t.amount) || 0;
            }

        });

        return data;

    }, [transactions]);


    const value = useMemo(() => ({
        transactions,
        loading,
        error,
        errorType,
        pagination,
        stats: globalStats,
        chartData,
        fetchTransactions,
        addTransaction,
        updateTransactionCategory,
        handleRetry
    }), [
        transactions,
        loading,
        error,
        errorType,
        pagination,
        globalStats,
        chartData,
        fetchTransactions,
        handleRetry
    ]);


    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};