import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children, title, description, actions }) => {
    return (
        <div className="bg-[#FAF9F6] dark:bg-stone-950 min-h-screen flex text-stone-800 dark:text-stone-100 font-sans pb-24 md:pb-0 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
                {/* Global Header Layout */}
                {(title || description || actions) && (
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-10 pt-4 md:pt-0">
                        <div>
                            {title && (
                                <h1 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && (
                            <div className="flex items-center gap-3">
                                {actions}
                            </div>
                        )}
                    </header>
                )}

                {/* Main Content Area */}
                <main className="w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
