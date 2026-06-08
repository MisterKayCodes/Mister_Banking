import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const SuspendedAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setUserEmail(email);
    }
  }, [searchParams]);

  const handleContactSupport = () => {
    navigate('/live-support');
  };

  const handleLogout = () => {
    localStorage.removeItem('sa_auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8">
          
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Icon name="AlertTriangle" size={40} className="text-destructive" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Account Suspended
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Temporary Access Restriction
            </p>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                Your account has been suspended due to suspicious activities detected on your account.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is a temporary measure to protect your account and funds. Please contact our support team immediately to resolve this issue.
              </p>
              {userEmail && (
                <p className="text-xs text-muted-foreground border-t border-destructive/10 pt-3 mt-3">
                  <span className="font-semibold">Account:</span> {userEmail}
                </p>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <Button 
              onClick={handleContactSupport}
              variant="default"
              fullWidth
              className="h-12"
            >
              <Icon name="MessageSquare" size={18} className="mr-2" />
              Contact Support
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              fullWidth
              className="h-12"
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Info Footer */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              <Icon name="Clock" size={14} className="inline mr-1" />
              Our support team typically responds within 24 hours
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Sterling Archer Trust & Fiduciary
            <br />
            <span className="text-[10px]">Foundation Terminal © 2026. All rights reserved.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuspendedAccount;
