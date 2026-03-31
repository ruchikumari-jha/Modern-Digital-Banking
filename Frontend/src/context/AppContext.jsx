import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';

// ─────────────────────────────── USER ───────────────────────────────────────

const UserContext = createContext(null);

// ─────────────────────────────── BUDGETS ────────────────────────────────────

function budgetsReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'ADD':
            return [action.payload, ...state];
        case 'UPDATE':
            return state.map(b =>
                b.id === action.payload.id ? { ...b, ...action.payload } : b
            );
        case 'DELETE':
            return state.filter(b => b.id !== action.id);
        default:
            return state;
    }
}

const BudgetsContext = createContext(null);

// ─────────────────────────────── ALERTS ─────────────────────────────────────

function alertsReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;

        case 'MARK_READ':
            return state.map(a =>
                a.id === action.id ? { ...a, read: true } : a
            );

        case 'MARK_ALL_READ':
            return state.map(a => ({ ...a, read: true }));

        case 'ADD':
            if (state.some(a => a.id === action.payload.id)) return state;
            return [action.payload, ...state];

        default:
            return state;
    }
}

const AlertsContext = createContext(null);

// ─────────────────────────────── TOASTS ─────────────────────────────────────

function toastsReducer(state, action) {
    switch (action.type) {
        case 'ADD':
            if (state.some(t => t.message === action.payload.message)) return state;
            return [...state, { id: Date.now() + Math.random(), duration: 4000, ...action.payload }];
        case 'DISMISS':
            return state.filter(t => t.id !== action.id);
        case 'CLEAR':
            return [];
        default:
            return state;
    }
}

const ToastContext = createContext(null);

// ─────────────────────────────── THEME ──────────────────────────────────────

const ThemeContext = createContext(null);

// ─────────────────────────────── PROVIDER ───────────────────────────────────

export function AppProvider({ children }) {
    const API_BASE_URL = 'http://localhost:8000';

    // ── User & Account ──
    const [user, setUser] = useState(null);
    const [account, setAccount] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // ── Toasts ──
    const [toasts, dispatchToasts] = useReducer(toastsReducer, []);
    const addToast = useCallback((toast) => dispatchToasts({ type: 'ADD', payload: toast }), []);
    const dismissToast = useCallback((id) => dispatchToasts({ type: 'DISMISS', id }), []);
    const clearToasts = useCallback(() => dispatchToasts({ type: 'CLEAR' }), []);

    // ── Theme ──
    const [theme, setTheme] = React.useState(() => {
        try {
            const saved = localStorage.getItem('banking_theme');
            return saved ? saved : 'light';
        } catch { return 'light'; }
    });

    useEffect(() => {
        localStorage.setItem('banking_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    // ── Budgets & Alerts State ──
    const [budgets, dispatchBudgets] = useReducer(budgetsReducer, []);
    const [alerts, dispatchAlerts] = useReducer(alertsReducer, []);

    const addBudget = useCallback((budget) => dispatchBudgets({ type: 'ADD', payload: budget }), []);
    const updateBudget = useCallback((budget) => dispatchBudgets({ type: 'UPDATE', payload: budget }), []);
    const deleteBudget = useCallback((id) => dispatchBudgets({ type: 'DELETE', id }), []);

    const markAlertRead = useCallback(async (id) => {
    dispatchAlerts({ type: 'MARK_READ', id });

    try {
        const token = localStorage.getItem("access_token");

        await fetch(`${API_BASE_URL}/alerts/${id}/read`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.error(e);
    }
}, []);

    const markAllAlertsRead = useCallback(async () => {
    if (!user) return;

    dispatchAlerts({ type: 'MARK_ALL_READ' });

    try {
        const token = localStorage.getItem("access_token");

        await fetch(`${API_BASE_URL}/alerts/mark-all-read`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.error(e);
    }
}, [user]);

    const addAlert = useCallback((alert) => dispatchAlerts({ type: 'ADD', payload: alert }), []);

    // ── Initial Data Fetch ──
    const refreshUserData = useCallback(async () => {
        setAuthLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            setAuthLoading(false);
            setUser(null);
            setAccount(null);
            return;
        }

            try {
                // Fetch User
                const userRes = await fetch(`${API_BASE_URL}/api/auth/getuser`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                    setAccount(userData.account);
                    
                    const userId = userData.user.id;
                    const accountId = userData.account.id;
                    const date = new Date();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();

                    // Fetch Budgets
                    const budgRes = await fetch(`${API_BASE_URL}/budgets/?account_id=${accountId}&month=${month}&year=${year}`);
                    if (budgRes.ok) {
                        const budgData = await budgRes.json();
                        dispatchBudgets({ type: 'SET', payload: budgData });
                    }

                    // Fetch Alerts
                    const alertRes = await fetch(`${API_BASE_URL}/alerts/?user_id=${userId}`);
                    if (alertRes.ok) {
                        const alertData = await alertRes.json();
                        dispatchAlerts({
                            type: 'SET',
                            payload: alertData.map(a => ({
                                ...a,
                                read: a.is_read === false ? false : true
                        }))
                     });
                    }
                }
            } catch (err) {
                console.error("Error fetching global user data", err);
            } finally {
                setAuthLoading(false);
            }
    }, []);

    useEffect(() => {
        refreshUserData();
    }, [refreshUserData]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <UserContext.Provider value={{ user, account, authLoading, refreshUserData }}>
                <BudgetsContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
                    <AlertsContext.Provider value={{ alerts, markAlertRead, markAllAlertsRead, addAlert }}>
                        <ToastContext.Provider value={{ toasts, addToast, dismissToast, clearToasts }}>
                            {children}
                        </ToastContext.Provider>
                    </AlertsContext.Provider>
                </BudgetsContext.Provider>
            </UserContext.Provider>
        </ThemeContext.Provider>
    );
}

// ─────────────────────────────── HOOKS ──────────────────────────────────────

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within <AppProvider>');
    return ctx;
}

export function useBudgets() {
    const ctx = useContext(BudgetsContext);
    if (!ctx) throw new Error('useBudgets must be used within <AppProvider>');
    return ctx;
}

export function useAlerts() {
    const ctx = useContext(AlertsContext);
    if (!ctx) throw new Error('useAlerts must be used within <AppProvider>');
    return ctx;
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <AppProvider>');
    return ctx;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within <AppProvider>');
    return ctx;
}
