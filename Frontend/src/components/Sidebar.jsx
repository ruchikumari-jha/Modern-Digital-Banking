
import React from 'react';
import { LayoutDashboard, CreditCard, ArrowRightLeft, FileBarChart, User, Receipt, Gift, List, PieChart, Moon, Sun, Lightbulb, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme, useUser } from '../context/AppContext';
import logo from "../assets/APna BAnk.gif";

const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, account, authLoading } = useUser();

    const bankName = account?.bank_name || 'Apna Bank';
    const userName = user?.name || 'User';
    //     try {


    const logoText = React.useMemo(() => {
        const words = userName.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return 'B';
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    }, [userName]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', protected: true },
        { icon: ArrowRightLeft, label: 'Transactions', path: '/transaction', protected: true },
        { icon: Receipt, label: 'Bills', path: '/dashboard/bills', protected: true },
        { icon: Gift, label: 'Rewards', path: '/dashboard/rewards', protected: true },
        { icon: List, label: 'Rules', path: '/dashboard/rules', protected: true },
        { icon: PieChart, label: 'Budgets', path: '/dashboard/budgets', protected: true },
        { icon: Lightbulb, label: 'Insights', path: '/dashboard/insights', protected: true },
        { icon: Bell, label: 'Alerts', path: '/dashboard/alerts', protected: true },
        { icon: FileBarChart, label: 'Reporting', path: '/dashboard/reports', protected: true },
        { icon: User, label: 'Account', path: '/account', protected: false },
    ];

    const filteredItems = menuItems;

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="w-64 min-h-screen bg-amber-900/5 dark:bg-stone-950 border-r border-amber-200 dark:border-stone-800 flex flex-col p-6 hidden md:flex fixed left-0 top-0 backdrop-blur-xl z-50 transition-colors duration-300">
            {/* Logo */}
            <div className="mb-12">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <img 
                            src={logo} 
                            alt="logo" 
                            className="w-14 h-14 rounded-xl object-cover"
                        />
                    </div>
                    
                    <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                        {authLoading ? "Loading..." : bankName}
                    </h1>
                </div>
                <p className="mt-2 text-[11px] text-stone-400 uppercase tracking-[0.3em]">
                    Digital Banking
                </p>
            </div>

            <nav className="flex-1 space-y-2">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-400 dark:border-amber-500/50 shadow-sm'
                                : 'text-stone-500 dark:text-stone-400 border border-transparent hover:border-amber-300 dark:hover:border-stone-700 hover:bg-amber-50 dark:hover:bg-stone-900 hover:text-amber-800 dark:hover:text-amber-400'}
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-amber-100 dark:border-stone-800 space-y-4">
                <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 w-full"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <p className="text-[11px] text-stone-400 px-4">
                    Secure • <span className="text-amber-700 dark:text-amber-500">256-bit</span> encrypted
                </p>
            </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl border-t border-stone-100 dark:border-stone-800 z-50 px-2 py-2 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe transition-colors duration-300">
            {filteredItems.slice(0, 4).map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[3.5rem]
                        ${isActive 
                            ? 'text-amber-600 dark:text-amber-500 scale-110' 
                            : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:scale-105 active:scale-95'}
                    `}
                >
                    <item.icon className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
                </NavLink>
            ))}
            <button 
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[3.5rem] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:scale-105 active:scale-95"
                aria-label="Toggle Dark Mode"
            >
                {theme === 'dark' ? <Sun className="w-6 h-6 mb-1" /> : <Moon className="w-6 h-6 mb-1" />}
                <span className="text-[9px] font-black uppercase tracking-wider">Theme</span>
            </button>
        </div>
        </>
    );
};

export default Sidebar;
