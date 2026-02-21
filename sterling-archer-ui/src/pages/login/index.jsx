import React from 'react';
import { Helmet } from 'react-helmet';
import AuthLayout from '../../components/ui/AuthLayout';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import TrustIndicators from './components/TrustIndicators';

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Sign In - Sterling-Archer Trust</title>
        <meta name="description" content="Access your Sterling-Archer Trust account securely. Sign in to manage your banking, cryptocurrency trading, and institutional financial services." />
      </Helmet>

      <AuthLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground caption">
              Sign in to access your account
            </p>
          </div>

          <LoginForm />

          <TrustIndicators />

          <SecurityBadges />
        </div>
      </AuthLayout>
    </>
  );
};

export default Login;