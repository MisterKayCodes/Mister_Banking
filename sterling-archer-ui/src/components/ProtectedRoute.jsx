import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const location = useLocation();

  useEffect(() => {
    const verifyUserStatus = async () => {
      try {
        const token = localStorage.getItem('sa_auth_token');

        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch current user to verify they're still active
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;

        // Check if user account is still active
        if (!user.is_active) {
          // User has been suspended
          setIsSuspended(true);
          setUserEmail(user.email);
          
          // Allow /live-support for suspended users (they can contact support)
          // But redirect to suspension page for all other routes
          if (location.pathname === '/live-support') {
            setAuthorized(true);
          }
          
          setLoading(false);
          return;
        }

        // User is active - allow access
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        // Only clear token on 401 (unauthorized) errors
        // Don't clear on network errors or other API errors
        if (error.response?.status === 401) {
          localStorage.removeItem('sa_auth_token');
          localStorage.removeItem('user');
        }
        setLoading(false);
      }
    };

    verifyUserStatus();
  }, [location.pathname]);

  if (loading) {
    // Show loading state while verifying user status
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user was suspended and NOT trying to access support, redirect to suspension page
  if (isSuspended && location.pathname !== '/live-support') {
    return <Navigate to={`/suspended?email=${encodeURIComponent(userEmail)}`} replace />;
  }

  // If not authorized, redirect to login
  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  // Badge verified. Welcome to the Trust.
  return children;
};

export default ProtectedRoute;