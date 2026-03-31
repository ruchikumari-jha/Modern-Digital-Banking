
import React from 'react';
import AppLayout from '../components/AppLayout';
import Card from '../components/CreditCard';
import { Plus } from 'lucide-react';

const Cards = () => {
    return (
        <AppLayout title="My Cards" description="Manage your debit and credit cards.">
            <div className="max-w-5xl mx-auto w-full">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-8">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-black transition-transform active:scale-95 text-sm font-medium">
                        <Plus className="w-4 h-4" />
                        Add New Card
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                    {/* Primary Card */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 dark:text-stone-200">Primary Card</h3>
                         <Card />
                         <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-gray-100 dark:border-stone-800 shadow-sm flex justify-between items-center transition-colors">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-stone-100">Online Transactions</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Enabled</p>
                            </div>
                            <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                         </div>
                    </div>

                     {/* Secondary Card (Visual Mockup) */}
                     <div className="space-y-4 opacity-70">
                        <div className="flex justify-between items-center">
                             <h3 className="font-bold text-gray-800 dark:text-stone-200">Secondary Card</h3>
                             <span className="text-xs bg-gray-200 dark:bg-stone-800 px-2 py-1 rounded text-gray-600 dark:text-stone-400 transition-colors">Inactive</span>
                        </div>
                        
                        {/* Mockup of a different card style */}
                        <div className="w-full h-56 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                             <div className="flex justify-between items-start z-10">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Current Balance</p>
                                    <h2 className="text-2xl font-bold">₹0.00</h2>
                                </div>
                                <div className="italic font-bold text-xl tracking-widest">VISA</div>
                            </div>
                            <div className="z-10">
                                <p className="text-lg font-mono tracking-widest mb-4">**** **** **** 8899</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Card Holder</p>
                                        <p className="font-medium tracking-wide">HARSH KUMAR</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Expires</p>
                                        <p className="font-medium">12/26</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Cards;
