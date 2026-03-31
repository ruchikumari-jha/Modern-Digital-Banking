
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { User, Mail, CreditCard, Shield, Plus, X, ChevronDown } from 'lucide-react';
import BASE_URL from "../api";

const Account = () => {
    const [user, setUser] = useState(null);

    const [accounts, setAccounts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBank, setNewBank] = useState('');
    const [newAccNo, setNewAccNo] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            // Get accounts for this user
            const savedAccounts = localStorage.getItem(`accounts_${userData.email}`);
            if (savedAccounts) {
                setAccounts(JSON.parse(savedAccounts));
            } else {
                const initialAccount = { 
                    bank: userData.bank || userData.bankName || 'Apna Bank', 
                    accountNo: userData.accountNo || 'XXXX-XXXX-8890', 
                    type: 'Savings Account' 
                };
                setAccounts([initialAccount]);
                localStorage.setItem(`accounts_${userData.email}`, JSON.stringify([initialAccount]));
            }
        }
    }, []);


    const handleAddAccount = (e) => {
        e.preventDefault();
        const newAcc = { bank: newBank, accountNo: newAccNo, type: 'Savings Account' };
        const updatedAccounts = [...accounts, newAcc];
        setAccounts(updatedAccounts);
        localStorage.setItem(`accounts_${user.email}`, JSON.stringify(updatedAccounts));
        setIsModalOpen(false);
        setNewBank('');
        setNewAccNo('');
    };

    const handleSwitchAccount = (index) => {
        const selected = accounts[index];
        const updatedUser = { ...user, bank: selected.bank, accountNo: selected.accountNo };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        // Notification logic could go here
    };

     if (!user) {
        return (
            <AppLayout>
                <div className="flex-1 p-8 flex items-center justify-center min-h-[50vh]">
                    <p className="text-stone-500 dark:text-stone-400">Loading user profile...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="My Account"
            description="Manage your profile and linked bank accounts"
        >
                <div className="max-w-3xl">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-6 transition-colors duration-300">
                        <div className="h-40 bg-gradient-to-r from-amber-600 to-orange-400 dark:opacity-80 relative">
                            <div className="absolute -bottom-12 left-10">
                                <div className="w-28 h-28 rounded-full bg-white dark:bg-stone-900 p-1.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500">
                                        <User className="w-12 h-12" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 px-10 pb-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">{user.name || 'User Name'}</h2>
                                    <p className="text-amber-600 dark:text-amber-500 font-semibold text-sm uppercase tracking-wider">Premium Member</p>
                                </div>
                                 <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-amber-500 text-white rounded-2xl hover:bg-stone-800 dark:hover:bg-amber-600 transition-all shadow-md active:scale-95 text-sm font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New Account
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-300">
                            <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <User className="w-4 h-4" />
                                </div>
                                Personal Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-1">Full Name</p>
                                    <p className="text-stone-800 dark:text-stone-200 font-semibold">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-1">Email Address</p>
                                    <p className="text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-stone-400 dark:text-stone-600" /> {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-300">
                            <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                Financial Details
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-1">Select Active Account</p>
                                    <div className="relative mt-2">
                                        <select 
                                            value={accounts.findIndex(a => a.bank === user.bank)}
                                            onChange={(e) => handleSwitchAccount(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 dark:text-stone-200 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer"
                                        >
                                            {accounts.map((acc, idx) => (
                                                <option key={idx} value={idx}>
                                                    {acc.bank} ({acc.accountNo})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-600 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-1">Account Number</p>
                                        <p className="text-stone-800 dark:text-stone-200 font-mono text-sm bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 px-3 py-2 rounded-xl inline-block">
                                            {user.accountNo || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-1">Account Type</p>
                                        <p className="text-stone-800 dark:text-stone-200 font-semibold text-sm py-2">Savings Account</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-stone-800">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Add New Account</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-400 dark:text-stone-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddAccount} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-2 px-1">Bank Name</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="e.g. HDFC Bank, ICICI Bank"
                                        value={newBank}
                                        onChange={(e) => setNewBank(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-5 py-4 text-stone-800 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest mb-2 px-1">Account Number</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Enter your account number"
                                        value={newAccNo}
                                        onChange={(e) => setNewAccNo(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-5 py-4 text-stone-800 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button 
                                        type="submit"
                                        className="w-full bg-stone-900 dark:bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-stone-900/10 dark:shadow-none hover:bg-stone-800 dark:hover:bg-amber-600 transition-transform active:scale-[0.98]"
                                    >
                                        Link Account
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Account;
