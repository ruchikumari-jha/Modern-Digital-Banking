
import { useState, useCallback, useRef } from 'react';
import { useToast } from '../context/AppContext';

// Error type classifier
function classifyError(err) {
    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        return { type: 'timeout', title: 'Request Timed Out', message: 'The server took too long to respond. Please try again.' };
    }
    if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        return { type: 'auth', title: 'Session Expired', message: 'Your session has expired. Please log in again.' };
    }
    if (err.status === 422 || err.message?.includes('validation') || err.message?.includes('422')) {
        return { type: 'validation', title: 'Validation Error', message: err.message ?? 'Please check your input and try again.' };
    }
    if (err.status >= 500 || err.message?.includes('500') || err.message?.includes('server')) {
        return { type: 'server', title: 'Server Error', message: 'Something went wrong on our end. We are working on it.' };
    }
    if (!navigator.onLine || err.message?.includes('fetch') || err.message?.includes('network')) {
        return { type: 'network', title: 'No Connection', message: 'Check your network connection and try again.' };
    }
    return { type: 'unknown', title: 'Error', message: err.message ?? 'An unexpected error occurred.' };
}


export function useApiCall(apiFn, options = {}) {
    const {
        timeout = 10000,
        maxRetries = 2,
        successMsg = null,
        successTitle = null,
        silent = false,
    } = options;

    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const retryCountRef = useRef(0);
    const lastArgsRef = useRef([]);

    const execute = useCallback(async (...args) => {
        lastArgsRef.current = args;
        setLoading(true);
        setError(null);

        // Calculate backoff delay: 1s, 2s, 4s...
        const backoffDelay = retryCountRef.current > 0
            ? Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 8000)
            : 0;

        if (backoffDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }

        // Wrap with timeout
        const controller = new AbortController();
        const timerId = setTimeout(() => controller.abort(), timeout);

        try {
            const result = await apiFn(...args, { signal: controller.signal });
            clearTimeout(timerId);
            retryCountRef.current = 0;

            if (successMsg) {
                addToast({ type: 'success', title: successTitle ?? 'Success', message: successMsg });
            }
            setLoading(false);
            return { ok: true, data: result };
        } catch (err) {
            clearTimeout(timerId);
            const classified = classifyError(err);
            setError(classified);
            setLoading(false);

            if (!silent) {
                const canRetry = retryCountRef.current < maxRetries;
                addToast({
                    type: classified.type === 'validation' ? 'warning' : 'error',
                    title: classified.title,
                    message: classified.message,
                    duration: canRetry ? 8000 : 6000,
                    onRetry: canRetry ? () => {
                        retryCountRef.current += 1;
                        execute(...lastArgsRef.current);
                    } : undefined,
                });
            }
            return { ok: false, error: classified };
        }
    }, [apiFn, timeout, maxRetries, successMsg, successTitle, silent, addToast]);

    const reset = useCallback(() => {
        setError(null);
        setLoading(false);
        retryCountRef.current = 0;
    }, []);

    return { execute, loading, error, reset };
}
