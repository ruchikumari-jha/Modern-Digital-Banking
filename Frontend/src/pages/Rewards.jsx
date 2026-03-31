import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import axios from 'axios';
import { useUser } from "../context/AppContext";

import { 
    Gift, 
    ShoppingCart, 
    CreditCard, 
    RefreshCw, 
    Star, 
    TrendingUp, 
    ChevronRight, 
    Award,
    Zap,
    Plus,
    X,
    Loader2,
    Check,
    Coffee,
    Truck,
    Plane,
    AlertCircle
} from 'lucide-react';

import { useApiCall } from '../hooks/useApiCall';
import LoadingSpinner from '../components/LoadingSpinner';

const Rewards = () => {

    const [rewards, setRewards] = useState([]);
    const [bankRewards, setBankRewards] = useState(null);

    const { user } = useUser();   // ✅ FIX ADDED

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    const availablePrograms = [
        { name: 'Uber Rewards', icon: Truck, color: 'bg-black' },
        { name: 'Swiggy One', icon: Coffee, color: 'bg-orange-600' },
        { name: 'Zomato Gold', icon: TrendingUp, color: 'bg-red-600' },
        { name: 'Delta SkyMiles', icon: Plane, color: 'bg-blue-900' }
    ];

    const totalPoints = rewards.reduce(
        (acc, curr) => acc + curr.points_balance,
        0
    );

    // ✅ FIXED API CALL
    const fetchRewards = async () => {
        try {
            if (!user) return;

            const res = await axios.get(
                `http://127.0.0.1:8000/rewards/${user.id}`
            );

            setBankRewards(res.data);

        } catch (err) {
            console.error("Error fetching rewards:", err);
        }
    };

    // ✅ FIXED useEffect
    useEffect(() => {
        if (user) {
            fetchRewards();
        }
    }, [user]);

    const mockLinkAccountApi = async () => {
        const randomOutcome = Math.random();
        
        if (randomOutcome < 0.2) {
            throw new Error('timeout');
        } else if (randomOutcome < 0.4) {
            throw { status: 500, message: 'Internal Server Error' };
        } else if (randomOutcome < 0.5) {
            throw { status: 401, message: 'Unauthorized access' };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            id: Date.now(),
            program_name: selectedProgram.name,
            points_balance: Math.floor(Math.random() * 5000) + 500,
            last_updated: new Date().toLocaleString(),
            icon: selectedProgram.icon,
            color: selectedProgram.color,
            primary: false
        };
    };

    const { execute: linkAccount, loading: isSyncing, error: syncError, reset: resetSync } =
        useApiCall(mockLinkAccountApi, {
            successTitle: 'Account Linked',
            successMsg: 'Successfully connected reward account',
            maxRetries: 2
        });

    const handleLinkAccount = async () => {
        if (!selectedProgram) return;
        
        const result = await linkAccount();
        
        if (result.ok) {
            setRewards(prev => [...prev, result.data]);
            setTimeout(() => {
                setIsLinkModalOpen(false);
                setSelectedProgram(null);
            }, 500);
        }
    };
    
    const closeModal = () => {
        setIsLinkModalOpen(false);
        setSelectedProgram(null);
        resetSync();
    };

    const redeemPoints = async () => {
  try {
    const res = await axios.post(
      `http://127.0.0.1:8000/rewards/redeem/${user.id}`
    );

    alert("Redeemed ₹" + res.data.redeemed_amount);

    fetchRewards(); // refresh UI

  } catch (err) {
    console.error(err);
    alert("Failed to redeem");
  }
};

    return (
        <AppLayout
            title="Reward Programs"
            description="Track and manage your points across all platforms."
            actions={
                <button className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 text-gray-600 dark:text-gray-300 rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-stone-800 transition-all font-semibold text-sm">
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync all accounts</span>
                </button>
            }
        >
            <div>

                {/* ✅ POINTS DISPLAY FIXED */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-amber-600 dark:to-orange-700 rounded-3xl p-8 mb-10 text-white shadow-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Total Points Balance</p>
                            <h2 className="text-4xl font-bold">
                                {bankRewards ? bankRewards.reward_points : 0}
                            </h2>
                        </div>

                        <div className="flex gap-4">
                            <button className="bg-white text-black px-4 py-2 rounded" onClick={redeemPoints}>
                                Redeem Points
                            </button>
                        </div>
                    </div>
                </div>

                {/* EXISTING UI BELOW (UNCHANGED) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rewards.map((reward) => (
                        <div key={reward.id}>
                            <p>{reward.program_name}</p>
                            <p>{reward.points_balance}</p>
                        </div>
                    ))}

                    <button onClick={() => setIsLinkModalOpen(true)}>
                        + Link New Program
                    </button>
                </div>

            </div>
        </AppLayout>
    );
};

export default Rewards;