import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const Alerts = () => {
    const [alertsData, setAlertsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = getUserIdFromToken();

    const fetchAlerts = useCallback(async (isBackground = false) => {
        if (!userId) return;
        if (!isBackground) {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await axios.get(`${BASE_URL}/alerts/`, {
                params: { user_id: userId, skip: 0, limit: 50 },
                headers: authHeaders()
            });
            setAlertsData(res.data || []);
        } catch (err) {
            console.error("Fetch alerts error:", err);
            if (!isBackground) {
                setError("Failed to load alerts.");
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    }, [userId]);

    useEffect(() => {
        fetchAlerts(); // Initial load

        const intervalId = setInterval(() => {
            fetchAlerts(true); // Background refresh every 60s
        }, 60000);

        return () => clearInterval(intervalId);
    }, [fetchAlerts]);

    const handleMarkRead = async (alertId) => {
    try {
        await axios.post(`${BASE_URL}/alerts/mark-read`, null, {
            params: { alert_id: alertId },
            headers: authHeaders()
        });

        // IMPORTANT FIX 👇
        await fetchAlerts(true);

    } catch (err) {
        console.error("Mark read error:", err);
    }
};

    const handleMarkAllRead = async () => {
    try {
        await axios.post(`${BASE_URL}/alerts/mark-all-read`, null, {
            params: { user_id: userId },
            headers: authHeaders()
        });

        await fetchAlerts(true);

    } catch (err) {
        console.error("Mark all read error:", err);
    }
};

    const unreadCount = alertsData.filter(a => !a.is_read).length;

    return (
        <AppLayout
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-200 dark:border-amber-500/30">
                        <Bell className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <span>Alert Center</span>
                </div>
            }
            description="Manage your notifications and stay on top of your finances."
            actions={
                unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400 transition-all shadow-sm"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all read
                    </button>
                )
            }
        >
            <div className="max-w-4xl mx-auto w-full">
               <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 shadow-sm border border-stone-100 dark:border-stone-800 transition-colors">
                  {loading ? (
                       <div className="flex flex-col items-center justify-center h-48 gap-3">
                           <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                           <p className="text-sm font-bold text-stone-400">Loading alerts...</p>
                       </div>
                   ) : error ? (
                       <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-500">
                           <AlertCircle className="w-8 h-8" />
                           <p className="text-sm font-bold text-center">{error}</p>
                       </div>
                   ) : alertsData.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-48 gap-3">
                           <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center border border-stone-100 dark:border-stone-700">
                               <CheckCheck className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                           </div>
                           <p className="text-sm font-bold text-stone-400">No alerts yet</p>
                       </div>
                   ) : (
                       <div className="space-y-4">
                           {alertsData.map((alert) => {
                               // Determine colors
                               let badgeColor = "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
                               let iconBg = "bg-stone-50 dark:bg-stone-800";
                               let iconColor = "text-stone-400";
                               
                               if (alert.type === "budget_exceeded") {
                                   badgeColor = "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
                                   iconBg = "bg-red-50 dark:bg-red-500/10";
                                   iconColor = "text-red-500";
                               } else if (alert.type === "low_balance" || alert.type === "budget_warning" || alert.type === "bill_due") {
                                   badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
                                   iconBg = "bg-amber-50 dark:bg-amber-500/10";
                                   iconColor = "text-amber-500";
                               }
                               
                               return (
                                   <div 
                                       key={alert.id} 
                                       className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${!alert.is_read ? 'bg-amber-50/30 dark:bg-stone-800/50 border-amber-200 dark:border-amber-500/30 shadow-sm' : 'bg-transparent border-stone-100 dark:border-stone-800 opacity-70'}`}
                                    >
                                       <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${iconBg}`}>
                                           <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
                                       </div>
                                       
                                       <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${badgeColor}`}>
                                                    {alert.type.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs font-bold text-stone-400">
                                                    {new Date(alert.created_at).toLocaleString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${!alert.is_read ? 'font-bold text-stone-800 dark:text-stone-200' : 'font-medium text-stone-600 dark:text-stone-400'}`}>
                                                {alert.message}
                                            </p>
                                       </div>
                                       
                                       {!alert.is_read && (
                                           <button
                                               onClick={() => handleMarkRead(alert.id)}
                                               className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 text-stone-400 hover:text-amber-600 hover:border-amber-200 dark:hover:border-amber-500/40 transition-colors"
                                               title="Mark as read"
                                           >
                                               <CheckCheck className="w-5 h-5" />
                                           </button>
                                       )}
                                   </div>
                               );
                           })}
                       </div>
                   )}
               </div>
            </div>
        </AppLayout>
    );
};

export default Alerts;
