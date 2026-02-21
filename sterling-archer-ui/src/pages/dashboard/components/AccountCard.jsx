import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountCard = ({ account, onViewDetails }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(amount);
  };

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return 'Wallet';
      case 'savings':
        return 'PiggyBank';
      case 'crypto':
        return 'Bitcoin';
      default:
        return 'CreditCard';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent/10">
            <Icon 
              name={getAccountTypeIcon(account?.type)} 
              size={24} 
              color="var(--color-accent)" 
            />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              {account?.name}
            </h3>
            <p className="text-sm text-muted-foreground caption mt-1">
              {account?.type}
            </p>
          </div>
        </div>
        {account?.status === 'active' && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-xs font-medium rounded-lg caption">
            <Icon name="CheckCircle" size={14} color="currentColor" />
            Active
          </span>
        )}
      </div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground caption mb-2">Available Balance</p>
        <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          {formatCurrency(account?.balance, account?.currency)}
        </p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground caption mb-1">Account Number</p>
          <p className="text-sm font-mono font-medium text-foreground">
            {account?.accountNumber}
          </p>
        </div>
        <button
          onClick={() => onViewDetails(account)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-lg transition-smooth"
        >
          <span>Details</span>
          <Icon name="ChevronRight" size={16} color="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default AccountCard;