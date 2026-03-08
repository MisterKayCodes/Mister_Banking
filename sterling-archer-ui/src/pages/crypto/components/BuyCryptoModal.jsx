import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BuyCryptoModal = ({ isOpen, onClose, onExchange, isSubmitting, accountBalance }) => {
  const [formData, setFormData] = useState({
    crypto_symbol: 'BTC',
    amount_usdt: '',
    pin: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onExchange(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header - Bitcoin Orange for the crypto vibe */}
        <div className="p-6 bg-[#F7931A] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="RefreshCcw" size={20} />
            <h3 className="font-black uppercase tracking-tighter">Asset Acquisition</h3>
          </div>
          <button type="button" onClick={onClose} className="hover:opacity-70 transition-opacity">
            <Icon name="X" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Asset Selector */}
          <div className="flex bg-muted p-1 rounded-2xl">
            {['BTC', 'USDT'].map((symbol) => (
              <button
                key={symbol}
                type="button"
                className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all ${formData.crypto_symbol === symbol
                    ? 'bg-card text-foreground shadow-md scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => setFormData({ ...formData, crypto_symbol: symbol })}
              >
                {symbol === 'BTC' ? 'Bitcoin' : 'Tether'}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                Purchase Amount (USD)
              </label>
              <span className="text-[10px] font-bold text-accent uppercase">
                Bal: ${accountBalance?.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                className="w-full bg-muted border-none rounded-2xl p-5 pl-10 font-mono text-xl focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="0.00"
                value={formData.amount_usdt}
                onChange={(e) => setFormData({ ...formData, amount_usdt: e.target.value })}
              />
            </div>
          </div>

          {/* Security PIN */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-2">
              Authorization PIN
            </label>
            <input
              type="password"
              required
              maxLength={4}
              className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 text-center tracking-[1em] text-2xl focus:bg-accent/10 transition-all font-mono"
              placeholder="••••"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
            />
          </div>

          {/* Warning Note */}
          <div className="bg-muted/50 p-4 rounded-2xl border border-border">
            <p className="text-[10px] leading-relaxed text-muted-foreground italic text-center">
              Exchange rates are finalized at the moment of execution. Purchased assets will be deposited directly into your Digital Asset Vault.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? 'Processing Exchange...' : `Purchase ${formData.crypto_symbol}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyCryptoModal;