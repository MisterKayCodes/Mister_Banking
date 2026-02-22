import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountSummary = ({ accounts = [], wallet = null }) => {
  // Mister, we use the same oracle price from the dashboard/backend here
  const btcPrice = 64500; 

  const formatCurrency = (amount, currency = 'USD') => {
    const numericAmount = parseFloat(amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  // 1. Calculate Fiat (USD Accounts)
  const fiatBalance = (accounts || []).reduce((sum, acc) => {
    const val = parseFloat(acc?.balance || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  
  // 2. Calculate Digital Assets (BTC converted to USD + USDT)
  const btcValuation = parseFloat(wallet?.btc_balance || 0) * btcPrice;
  const usdtValuation = parseFloat(wallet?.usdt_balance || 0);
  const totalDigitalAssets = (isNaN(btcValuation) ? 0 : btcValuation) + (isNaN(usdtValuation) ? 0 : usdtValuation);
  
  // 3. The Grand Total
  const totalNetWorth = fiatBalance + totalDigitalAssets;
  
  const activeAccounts = (accounts?.length || 0) + (wallet ? 1 : 0);

  const metrics = [
    {
      label: 'Total Net Worth',
      value: formatCurrency(totalNetWorth),
      icon: 'ShieldCheck',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Active Vaults',
      value: activeAccounts.toString(),
      icon: 'Landmark',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Digital Assets',
      value: formatCurrency(totalDigitalAssets),
      icon: 'Bitcoin',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
          Financial Vault
        </h2>
        <Icon name="PieChart" size={24} color="var(--color-accent)" />
      </div>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-smooth"
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor}`}>
                <Icon name={metric.icon} size={24} color={metric.color} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground caption mb-1">
                  {metric.label}
                </p>
                <p className="text-xl md:text-2xl font-heading font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground caption">
          <Icon name="TrendingUp" size={16} color="var(--color-success)" />
          <span>Capital is secured and verified</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;