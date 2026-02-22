import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountCard = ({ account, onViewDetails }) => {
  const isCrypto = account?.type === 'Crypto';
  
  // Mister, using your backend oracle price or a solid fallback
  const btcPrice = account?.btcPrice || 64500; 

  const btcAmt = isCrypto ? Number(account.balance) : 0;
  const usdtAmt = isCrypto ? Number(account.secondaryBalance) : 0;
  
  // Mister, the valuation logic for the headline
  const totalValuation = (btcAmt * btcPrice) + usdtAmt;

  const name = account?.name || (isCrypto ? 'Digital Asset Vault' : 'Standard Account');
  const type = account?.type || 'Checking';
  const currency = account?.currency || 'USD';

  const formatValue = (amount, curr, isHeadline = false) => {
    try {
      if (isHeadline || curr === 'USD') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }
      
      const decimals = curr === 'BTC' ? 8 : 2;
      return `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
      }).format(amount)} ${curr}`;
    } catch (e) {
      return `${amount} ${curr}`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-warm-md transition-smooth flex flex-col h-full">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
            <Icon name={isCrypto ? 'Bitcoin' : 'Wallet'} size={24} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground caption mt-1">{type}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-xs font-medium rounded-lg">
          <Icon name="CheckCircle" size={14} />
          Active
        </span>
      </div>

      {/* Balance Section */}
      <div className="mb-6 flex-grow">
        <p className="text-sm text-muted-foreground caption mb-2">Total Valuation (USD)</p>
        <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          {isCrypto ? formatValue(totalValuation, 'USD', true) : formatValue(account.balance, currency)}
        </p>
        
        {isCrypto && (
          <div className="mt-4 space-y-2 pt-4 border-t border-border/50">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Bitcoin Holdings</span>
                <span className="font-mono text-foreground font-medium">{formatValue(btcAmt, 'BTC')}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tether Balance</span>
                <span className="font-mono text-foreground font-medium">{formatValue(usdtAmt, 'USDT')}</span>
             </div>
          </div>
        )}
      </div>

      {/* Footer Section - Conditional Logic Here */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="max-w-[150px]">
          {!isCrypto ? (
            <>
              <p className="text-xs text-muted-foreground caption mb-1">Account Number</p>
              <p className="text-sm font-mono text-foreground truncate">
                {account?.account_number || '****'}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-accent/60 italic text-xs">
              <Icon name="ShieldCheck" size={14} />
              <span>Multi-Asset Secured</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onViewDetails(account)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-smooth"
        >
          <span>{isCrypto ? 'Manage Vault' : 'View Details'}</span>
          <Icon name="ArrowUpRight" size={16} />
        </button>
      </div>
    </div>
  );
};

export default AccountCard;