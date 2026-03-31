
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, LogOut } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import CurrencyConverter from '../components/CurrencyConverter';
import RecentTransactions from '../components/RecentTransactions';
import UpcomingBillsWidget from '../components/UpcomingBillsWidget';
import BudgetProgress from '../components/BudgetProgress';
import { useUser } from '../context/AppContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, authLoading } = useUser();



    const handleLogout = () => {
        localStorage.removeItem('access_token');
        // sessionStorage.removeItem('isUnlocked');
        navigate('/login');
    };

    return (
        <AppLayout
            title={
                <>
                    Welcome back,{' '}
                    <span className="font-bold text-amber-700 dark:text-amber-500">
                        {authLoading ? "..." : (user?.name || "User")}
                    </span>
                </>
            }
            description="Accounts Overview"
            actions={
                <button
                    onClick={handleLogout}
                    className="rounded-2xl px-5 py-2.5 flex items-center gap-2 text-sm font-semibold
                                bg-white/70 dark:bg-stone-900 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400
                                hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800 transition-colors shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            }
        >
            {/* Dashboard Grid */}
                <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
                    {/* Main Area */}
                    <div className="2xl:col-span-2 space-y-8">


                        {/* Middle Row: Transactions */}
                        <div>
                            <RecentTransactions />
                        </div>

                        {/* Bottom Row: Budget + Currency */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <BudgetProgress />
                            <CurrencyConverter />
                        </div>
                    </div>

                    {/* Side Column */}
                    <div className="space-y-8">
                        <UpcomingBillsWidget />
                    </div>
                </div>
        </AppLayout>
    );
};

export default Dashboard;
