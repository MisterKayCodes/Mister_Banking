import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated
  const token = localStorage.getItem('sa_auth_token');

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }

  // Badge verified. Welcome to the Trust.
  return children;
};

export default ProtectedRoute;