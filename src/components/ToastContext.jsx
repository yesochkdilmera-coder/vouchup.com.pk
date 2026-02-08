import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-item ${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <CheckCircle size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                .toast-container {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    z-index: 9999;
                    pointer-events: none;
                }
                .toast-item {
                    pointer-events: auto;
                    min-width: 280px;
                    max-width: 400px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 1rem;
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .toast-item.success { border-left: 4px solid #10b981; }
                .toast-item.error { border-left: 4px solid #ef4444; }
                .toast-item.info { border-left: 4px solid #3b82f6; }
                .toast-icon { flex-shrink: 0; }
                .toast-item.success .toast-icon { color: #10b981; }
                .toast-item.error .toast-icon { color: #ef4444; }
                .toast-item.info .toast-icon { color: #3b82f6; }
                .toast-message { flex: 1; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
                .toast-close { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.25rem; }
                .toast-close:hover { color: #475569; }

                @media (max-width: 640px) {
                    .toast-container {
                        bottom: 6rem;
                        left: 1rem;
                        right: 1rem;
                    }
                    .toast-item {
                        min-width: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
