import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountHero = ({ account, loading }) => {
  if (loading) return <div className="h-48 bg-muted animate-pulse rounded-3xl" />;

  const isCrypto = account?.type === 'Crypto';

  const formatBalance = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-3xl p-8 mb-8">
      {/* Added a subtle background glow for that 'Premium' feel */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
              <Icon name={isCrypto ? 'Bitcoin' : 'Wallet'} size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {account?.name || 'Standard Vault'}
            </span>
          </div>

          <p className="text-sm text-muted-foreground caption mb-1">Available Balance</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground">
            {formatBalance(account?.balance, account?.currency)}
          </h1>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span className="px-4 py-1.5 bg-success/10 text-success text-xs font-bold rounded-full uppercase tracking-widest border border-success/20">
            ● Secure & Active
          </span>
          <p className="text-sm font-mono text-muted-foreground">
            ID: {account?.account_number || account?.btc_address?.substring(0, 12) + '...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountHero;