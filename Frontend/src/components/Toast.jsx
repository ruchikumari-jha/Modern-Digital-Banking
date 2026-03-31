
import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../context/AppContext';

const ICONS = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
};

const BG = {
    success: 'border-green-100 bg-green-50/90',
    error: 'border-red-100 bg-red-50/90',
    warning: 'border-amber-100 bg-amber-50/90',
    info: 'border-blue-100 bg-blue-50/90',
};

// Individual toast item — auto-dismisses after `duration` ms
function ToastItem({ toast }) {
    const { dismissToast } = useToast();

    useEffect(() => {
        if (toast.duration === Infinity) return;
        const t = setTimeout(() => dismissToast(toast.id), toast.duration ?? 4000);
        return () => clearTimeout(t);
    }, [toast.id, toast.duration, dismissToast]);

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg backdrop-blur-sm max-w-sm w-full
                        animate-in slide-in-from-right-4 fade-in duration-300
                        ${BG[toast.type] ?? BG.info}`}
        >
            {ICONS[toast.type] ?? ICONS.info}
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className="text-xs font-black text-stone-900 mb-0.5">{toast.title}</p>
                )}
                <p className="text-xs font-bold text-stone-600 leading-relaxed">{toast.message}</p>
                {toast.onRetry && (
                    <button
                        onClick={toast.onRetry}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors"
                    >
                        ↺ Retry
                    </button>
                )}
            </div>
            <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 p-1 hover:bg-stone-100 rounded-lg transition-colors"
            >
                <X className="w-3.5 h-3.5 text-stone-400" />
            </button>
        </div>
    );
}

// Toast container — fixed bottom-right stack
export default function Toast() {
    const { toasts } = useToast();
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
            {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
        </div>
    );
}
