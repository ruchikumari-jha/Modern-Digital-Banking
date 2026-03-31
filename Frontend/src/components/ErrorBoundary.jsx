// ─────────────────────────────────────────────────────────────
//  ErrorBoundary.jsx — Catches React render errors gracefully
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8">
                    <div className="text-center max-w-sm">
                        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 mb-2">Something went wrong</h2>
                        <p className="text-stone-500 text-sm mb-6">
                            {this.state.error?.message ?? 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="flex items-center gap-2 mx-auto bg-stone-900 text-white font-black px-6 py-3 rounded-2xl hover:bg-stone-800 transition-all shadow-lg shadow-black/5"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
