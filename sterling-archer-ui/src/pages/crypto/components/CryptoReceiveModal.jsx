import React from 'react';
import Icon from '../../../components/AppIcon';

const CryptoReceiveModal = ({ isOpen, onClose, account, fullName }) => {
  if (!isOpen || !account) return null;

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    // Logic for a "Copied" toast can be triggered here
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Bitcoin Orange for Crypto Context */}
        <div className="p-6 bg-[#F7931A] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="Download" size={20} />
            <h3 className="font-black uppercase tracking-tighter">Inbound Digital Assets</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <Icon name="X" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Beneficiary Name</p>
            <h2 className="text-xl font-heading font-bold">{fullName || 'Verified Citizen'}</h2>
          </div>

          <div className="space-y-4">
            {/* BTC Address Field */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-border group relative">
              <p className="text-[10px] font-bold uppercase text-[#F7931A] mb-1 font-black">Bitcoin Address (BTC)</p>
              <div className="flex justify-between items-center gap-4">
                <span className="font-mono text-[13px] font-bold tracking-tight text-foreground break-all leading-tight">
                  {account?.btc_address || 'Address Not Generated'}
                </span>
                <button 
                  onClick={() => copyToClipboard(account?.btc_address)}
                  className="p-2.5 bg-card hover:bg-[#F7931A]/10 rounded-xl text-[#F7931A] transition-colors border border-border shrink-0 shadow-sm"
                  title="Copy BTC Address"
                >
                  <Icon name="Copy" size={16} />
                </button>
              </div>
            </div>

            {/* USDT Address Field */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-border group relative">
              <p className="text-[10px] font-bold uppercase text-[#26A17B] mb-1 font-black">Tether Address (USDT)</p>
              <div className="flex justify-between items-center gap-4">
                <span className="font-mono text-[13px] font-bold tracking-tight text-foreground break-all leading-tight">
                  {account?.usdt_address || 'Address Not Generated'}
                </span>
                <button 
                  onClick={() => copyToClipboard(account?.usdt_address)}
                  className="p-2.5 bg-card hover:bg-[#26A17B]/10 rounded-xl text-[#26A17B] transition-colors border border-border shrink-0 shadow-sm"
                  title="Copy USDT Address"
                >
                  <Icon name="Copy" size={16} />
                </button>
              </div>
            </div>

            {/* Network Note */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest text-center">Supported Network</p>
              <p className="font-bold text-foreground text-center text-xs uppercase">Bitcoin Core / Ethereum (ERC-20)</p>
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-2xl border border-accent/20 flex gap-4 items-start">
            <Icon name="ShieldCheck" size={20} className="text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Blockchain transfers are permanent. Please verify the network before sending. Funds are typically credited after 3 network confirmations.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 border border-border text-foreground rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all active:scale-[0.98]"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoReceiveModal;