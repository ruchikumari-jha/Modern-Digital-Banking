import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const PAGE_SIZE = 8;
const API_BASE_URL = 'http://localhost:8000';

const Transaction = () => {

    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // ✅ FETCH FROM BACKEND
    const fetchTransactions = async () => {
        try {
            // ✅ SET ONCE
            localStorage.setItem("accountID", "16");

            // ✅ FIX: DEFINE accountId
            const accountId = Number(localStorage.getItem("accountID"));

            const res = await fetch(
                `${API_BASE_URL}/transactions?account_id=${accountId}&page=${page}&limit=${PAGE_SIZE}`,
                { credentials: 'include' }
            );

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();

            setTransactions(data.transactions || []);
            setTotalPages(data.totalPages || 1);

        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    // ✅ EXPORT
    const handleExport = () => {
        let userId = "";
        try {
            const token = localStorage.getItem("access_token");
            if (token) userId = JSON.parse(atob(token.split(".")[1])).user_id;
        } catch (e) {}

        window.open(`${API_BASE_URL}/export/transactions?format=csv&user_id=${userId}`);
    };

    return (
        <AppLayout
            title="Payment History"
            description="Track your real transactions"
            actions={
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            }
        >

            <div className="bg-white rounded-2xl shadow p-4">

                {transactions.length === 0 ? (
                    <p className="text-center text-gray-400">No transactions</p>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="flex justify-between p-3 border-b">

                            <div>
                                <p className="font-bold">{t.description}</p>
                                <p className="text-xs text-gray-400">{t.category}</p>
                            </div>

                            <div className="text-right">
                                <p className={t.txn_type === "credit" ? "text-green-600" : "text-black"}>
                                    {t.txn_type === "credit" ? '+' : '-'}₹{t.amount}
                                </p>
                            </div>

                        </div>
                    ))
                )}

                {/* Pagination */}
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft />
                    </button>

                    <span>Page {page} / {totalPages}</span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <ChevronRight />
                    </button>
                </div>

            </div>

        </AppLayout>
    );
};

export default Transaction;