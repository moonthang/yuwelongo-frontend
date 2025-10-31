import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const Toast = ({ toast, onRemove }) => {
    const { id, message, type } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(id);
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [id, onRemove]);
 
    const toastTypeClasses = {
        success: 'bg-success text-white',
        error: 'bg-danger text-white',
        info: 'bg-info text-white',
    };

    const toastTitles = {
        success: 'Éxito',
        error: 'Error',
        info: 'Información',
    };

    return (
        <div className={`toast show ${toastTypeClasses[type] || 'bg-secondary text-white'}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <strong className="me-auto">{toastTitles[type] || 'Notificación'}</strong>
                <button type="button" className="btn-close" onClick={() => onRemove(id)} aria-label="Close"></button>
            </div>
            <div className="toast-body">
                {message}
            </div>
        </div>
    );
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;