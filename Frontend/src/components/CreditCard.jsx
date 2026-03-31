
import React from 'react';

const Card = ({ cardHolderName = 'Card Holder' }) => {
    return (
        <div className="relative w-full max-w-md h-56 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-200 to-orange-200 dark:from-amber-600 dark:via-amber-500 dark:to-orange-500 text-stone-900 dark:text-stone-50 shadow-[0_24px_80px_rgba(146,118,84,0.45)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] p-6 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
            {/* Subtle texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_55%)] opacity-70" />
            <div className="absolute -right-12 -bottom-10 w-40 h-40 bg-white/40 dark:bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-stone-700/80 dark:text-stone-100/80 text-xs font-semibold tracking-[0.25em] uppercase">
                            Total Balance
                        </p>
                        <h3 className="text-3xl font-semibold mt-2">₹456,000.00</h3>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="px-3 py-1 rounded-full bg-amber-900/10 dark:bg-stone-900/30 border border-amber-500/40 dark:border-amber-400/30 text-[11px] font-medium text-amber-900 dark:text-amber-100">
                            Visa Platinum
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-stone-800/80 dark:text-stone-100/80 text-[11px] tracking-[0.25em] mb-2">
                            {cardHolderName.toUpperCase()}
                        </p>
                        <p className="text-lg tracking-[0.35em] font-mono">
                            4450 2216 0223 1299
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <p className="text-stone-800/80 dark:text-stone-100/80 text-xs">09/28</p>
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/70 dark:bg-amber-400/70 border border-amber-300 dark:border-amber-500" />
                            <div className="w-8 h-8 rounded-full bg-orange-300/80 dark:bg-orange-500/80 mix-blend-multiply" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
