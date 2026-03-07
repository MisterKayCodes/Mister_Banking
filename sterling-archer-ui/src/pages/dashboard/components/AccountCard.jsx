import React from 'react';
import { useNavigate } from 'react-router-dom';
// Corrected path: Up 3 levels to reach src/components/AppIcon
import Icon from '../../../components/AppIcon';

const AccountCard = ({ account }) => {
  const navigate = useNavigate();
  const isCrypto = account?.type === 'Crypto';
  
  // Real-time Valuation Logic
  const btcPrice = account?.btcPrice || 64500; 
  const btcAmt = isCrypto ? Number(account.btc_balance || 0) : 0;
  const usdtAmt = isCrypto ? Number(account.usdt_balance || 0) : 0;
  
  const totalValuation = isCrypto 
    ? (btcAmt * btcPrice) + usdtAmt 
    : Number(account.balance || 0);

  const name = account?.name || (isCrypto ? 'Digital Asset Vault' : 'Standard Account');
  const type = account?.type || 'Checking';

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

  const handleNavigation = () => {
    const accountId = account.id || account.account_number;
    const route = isCrypto ? `/crypto/${accountId}` : `/accounts/${accountId}`;
    navigate(route);
  };

  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 hover:shadow-warm-md transition-smooth flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${
            isCrypto ? 'bg-[#F7931A]/10 text-[#F7931A]' : 'bg-accent/10 text-accent'
          }`}>
            <Icon name={isCrypto ? 'Bitcoin' : 'Wallet'} size={22} />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-foreground">{name}</h3>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{type}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-success/5 text-success text-[9px] font-black uppercase rounded-lg border border-success/10">
          <Icon name="CheckCircle" size={10} />
          Active
        </span>
      </div>

      {/* Balance */}
      <div className="mb-6 flex-grow">
        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter mb-1 opacity-70">Total Valuation</p>
        <p className="text-3xl font-heading font-bold text-foreground tracking-tighter">
          {formatValue(totalValuation, 'USD', true)}
        </p>
        
        {isCrypto && (
          <div className="mt-5 space-y-2.5 pt-5 border-t border-border/40">
             <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground font-medium uppercase tracking-tight">BTC Holdings</span>
                <span className="font-mono text-foreground font-bold">{formatValue(btcAmt, 'BTC')}</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground font-medium uppercase tracking-tight">USDT Balance</span>
                <span className="font-mono text-foreground font-bold">{formatValue(usdtAmt, 'USDT')}</span>
             </div>
          </div>
        )}
      </div>

      {/* Footer - Modified Button Style */}
      <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
        <div className="overflow-hidden">
          {!isCrypto ? (
            <>
              <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Account Number</p>
              <p className="text-[11px] font-mono text-foreground truncate opacity-60">
                {account?.account_number || '••••'}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-accent/80 italic text-[9px] font-bold uppercase tracking-tighter">
              <Icon name="ShieldCheck" size={12} />
              <span>Secured</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleNavigation}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/70 border border-border rounded-xl hover:bg-foreground hover:text-background hover:border-foreground transition-all active:scale-95"
        >
          <span>{isCrypto ? 'Manage' : 'Details'}</span>
          <Icon name="ArrowRight" size={12} />
        </button>
      </div>
    </div>
  );
};

export default AccountCard;