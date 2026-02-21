import React from 'react';
import { Helmet } from 'react-helmet';
import AuthLayout from '../../components/ui/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import SecurityBadges from './components/SecurityBadges';
import TrustIndicators from './components/TrustIndicators';

const SignUp = () => {
  return (
    <>
      <Helmet>
        <title>Sign Up - Sterling-Archer Trust</title>
        <meta name="description" content="Create your Sterling-Archer Trust account and access institutional banking services with cryptocurrency trading capabilities." />
      </Helmet>

      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-2">
              Create Your Account
            </h2>
            <p className="text-sm md:text-base text-muted-foreground caption">
              Join Sterling-Archer Trust for premium institutional banking
            </p>
          </div>

          <RegistrationForm />

          <SecurityBadges />

          <TrustIndicators />
        </div>
      </AuthLayout>
    </>
  );
};

export default SignUp;