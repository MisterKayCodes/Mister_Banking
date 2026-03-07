import React, { useState, useCallback } from 'react';
import Toast from 'components/ui/Toast';

export const useToast = () => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    const ToastComponent = toast ? (
        <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
        />
    ) : null;

    return { showToast, ToastComponent };
};
