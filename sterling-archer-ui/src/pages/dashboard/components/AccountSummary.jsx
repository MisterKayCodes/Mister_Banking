import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountSummary = ({ accounts }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(amount);
  };

  const totalBalance = accounts?.reduce((sum, account) => sum + account?.balance, 0);
  const activeAccounts = accounts?.filter(account => account?.status === 'active')?.length;
  const cryptoAccounts = accounts?.filter(account => account?.type?.toLowerCase() === 'crypto');
  const totalCryptoValue = cryptoAccounts?.reduce((sum, account) => sum + account?.balance, 0);

  const metrics = [
    {
      label: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: 'Wallet',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Active Accounts',
      value: activeAccounts?.toString(),
      icon: 'CreditCard',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Crypto Holdings',
      value: formatCurrency(totalCryptoValue),
      icon: 'Bitcoin',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
          Account Summary
        </h2>
        <Icon name="PieChart" size={24} color="var(--color-accent)" />
      </div>
      <div className="space-y-4">
        {metrics?.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-smooth"
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric?.bgColor}`}>
                <Icon name={metric?.icon} size={24} color={metric?.color} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground caption mb-1">
                  {metric?.label}
                </p>
                <p className="text-xl md:text-2xl font-heading font-bold text-foreground">
                  {metric?.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground caption">
          <Icon name="TrendingUp" size={16} color="var(--color-success)" />
          <span>Portfolio up 12.5% this month</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;