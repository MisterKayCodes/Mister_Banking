import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatCrypto, formatFiat } from '../../../utils/formatters';
import { calculateCryptoValuation } from '../../../utils/calculators';

const CryptoHero = ({ account, loading }) => {
  if (loading) return <div className="h-64 bg-card animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Icon name="Cpu" size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Icon name="ShieldCheck" size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Multi-Asset Secured Vault
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BTC Asset */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F7931A]">
              <Icon name="Bitcoin" size={18} />
              <span className="text-xs font-bold uppercase">Bitcoin Holdings</span>
            </div>
            <h2 className="text-4xl font-heading font-bold tracking-tighter">
              {formatCrypto(account?.btc_balance, 'BTC')} <span className="text-lg text-muted-foreground">BTC</span>
            </h2>
          </div>

          {/* USDT Asset */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#26A17B]">
              <Icon name="Zap" size={18} />
              <span className="text-xs font-bold uppercase">Tether Balance</span>
            </div>
            <h2 className="text-4xl font-heading font-bold tracking-tighter">
              {formatCrypto(account?.usdt_balance, 'USDT')} <span className="text-lg text-muted-foreground">USDT</span>
            </h2>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Valuation (USD)</p>
            <p className="text-2xl font-bold">{formatFiat(calculateCryptoValuation(account?.btc_balance, account?.usdt_balance))}</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase rounded-full border border-success/20">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoHero;