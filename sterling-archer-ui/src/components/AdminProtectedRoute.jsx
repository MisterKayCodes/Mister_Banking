import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';

const AdminProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState('loading'); // loading, authorized, unauthorized
    const token = localStorage.getItem('sa_auth_token');

    useEffect(() => {
        const verifyAdmin = async () => {
            if (!token) {
                setStatus('unauthorized');
                return;
            }

            try {
                const response = await api.get('/users/me');
                if (response.data.is_admin) {
                    setStatus('authorized');
                } else {
                    setStatus('unauthorized');
                }
            } catch (error) {
                setStatus('unauthorized');
            }
        };

        verifyAdmin();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        Verifying Clearance Level
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'unauthorized') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
