
import React from 'react';
import { Gift, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RewardsSummaryWidget = () => {
    const navigate = useNavigate();
    
    const totalPoints = 19135;
    const topPrograms = [
        { name: 'Amazon Pay', points: 2450, color: 'text-orange-500' },
        { name: 'Amex', points: 15400, color: 'text-indigo-600' }
    ];

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-blue-800 p-6 rounded-2xl shadow-lg shadow-indigo-100 text-white transition-all hover:shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <Gift className="w-5 h-5" />
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/rewards')}
                        className="p-1 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Rewards</p>
                <h3 className="text-3xl font-black mb-4">{totalPoints.toLocaleString()} <span className="text-xs font-medium text-indigo-300">points</span></h3>

                <div className="space-y-3 pt-4 border-t border-white/10">
                    {topPrograms.map(p => (
                        <div key={p.name} className="flex items-center justify-between text-xs">
                            <span className="text-indigo-100">{p.name}</span>
                            <span className="font-bold">{p.points.toLocaleString()} pts</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-green-400 bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+1,250 this month</span>
                </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        </div>
    );
};

export default RewardsSummaryWidget;
