import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Login from './pages/login';
import SignUp from './pages/sign-up';
import Dashboard from './pages/dashboard';
import Account from './pages/account';
import Crypto from './pages/crypto'; // Importing the new Digital Asset Controller
import KYCCenter from './pages/kyc-center'; // The new Verification Hub
import Support from './pages/support'; // Private Client Relations
import ProtectedRoute from 'components/ProtectedRoute';
import AdminProtectedRoute from 'components/AdminProtectedRoute';
import AdminLogin from './pages/admin-login';
import AdminDashboard from './pages/admin-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Private Routes - Only for verified Citizens */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Dynamic path for standard vault details */}
          <Route
            path="/accounts/:accountId"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          {/* The new Crypto Portal - Specifically for BTC/USDT Multi-Asset Vaults */}
          <Route
            path="/crypto/:accountId"
            element={
              <ProtectedRoute>
                <Crypto />
              </ProtectedRoute>
            }
          />

          {/* The Identity Verification Hub */}
          <Route
            path="/kyc-center"
            element={
              <ProtectedRoute>
                <KYCCenter />
              </ProtectedRoute>
            }
          />

          {/* Priority Support Channel */}
          <Route
            path="/live-support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />

          {/* Foundation Level Access - Administrative Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;