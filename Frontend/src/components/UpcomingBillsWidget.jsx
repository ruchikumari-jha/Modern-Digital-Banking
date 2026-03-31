
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ChevronRight, Loader2, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';

const UpcomingBillsWidget = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBills = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`http://localhost:8000/bills/user/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const mappedBills = data.map(b => {
                        const isUrgent = b.status === "pending"; 
                        return {
                            id: b.id,
                            name: b.biller_name,
                            amount: b.amount_due,
                            dueDate: new Date(b.due_date).toLocaleDateString(),
                            status: b.status,
                            urgent: isUrgent
                        };
                    });
                    setBills(mappedBills);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, [user]);

    return (
        <div className="bg-white/80 dark:bg-stone-900 p-6 rounded-3xl border border-amber-100 dark:border-stone-800 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:shadow-none transition-all hover:border-amber-300 dark:hover:border-stone-700 hover:shadow-[0_22px_70px_rgba(146,118,84,0.25)] dark:hover:shadow-none backdrop-blur">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">Upcoming Bills</h3>
                <button
                    onClick={() => navigate('/dashboard/bills')}
                    className="text-stone-400 dark:text-stone-500 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-8 flex justify-center text-amber-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-stone-400 dark:text-stone-500">
                        <WifiOff className="w-6 h-6" />
                        <p className="text-xs font-medium text-center">Bills unavailable.<br/>Backend service error.</p>
                    </div>
                ) : bills.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm font-medium">
                        No upcoming bills
                    </div>
                ) : (
                    bills.map((bill) => (
                    <div
                        key={bill.id}
                        className={`p-4 rounded-2xl flex items-center justify-between border bg-amber-50/70 dark:bg-stone-800/50 ${
                            bill.urgent
                                ? 'border-red-300 dark:border-red-900/50 shadow-[0_0_20px_rgba(248,113,113,0.35)] dark:shadow-[0_0_20px_rgba(248,113,113,0.15)]'
                                : 'border-amber-100 dark:border-stone-700/50 hover:border-amber-300 dark:hover:border-stone-600'
                        } transition-all`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                    bill.urgent
                                        ? 'bg-red-100 dark:bg-red-500/10 text-red-500 dark:text-red-400'
                                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}
                            >
                                {bill.urgent ? (
                                    <AlertTriangle className="w-5 h-5" />
                                ) : (
                                    <Clock className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-stone-900 dark:text-stone-200 text-sm">{bill.name}</p>
                                <p
                                    className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                                        bill.urgent ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                                    }`}
                                >
                                    {bill.status}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-stone-900 dark:text-stone-200">₹{bill.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">{bill.dueDate}</p>
                        </div>
                    </div>
                    ))
                )}
            </div>

            <button
                onClick={() => navigate('/dashboard/bills')}
                className="w-full mt-6 py-3 rounded-2xl border border-amber-300 dark:border-stone-700 text-amber-800 dark:text-stone-300 text-[11px] font-semibold hover:bg-amber-100 dark:hover:bg-stone-800 transition-all uppercase tracking-[0.3em]"
            >
                Add New Bill
            </button>
        </div>
    );
};

export default UpcomingBillsWidget;
