import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Mister, we check if the citizen has their badge
  const token = localStorage.getItem('mister_token');

  if (!token) {
    // No badge? Direct escort to the login page.
    return <Navigate to="/login" replace />;
  }

  // Badge verified. Welcome to the Trust.
  return children;
};

export default ProtectedRoute;