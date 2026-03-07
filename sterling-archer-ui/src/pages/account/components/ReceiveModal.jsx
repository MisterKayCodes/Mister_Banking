import React from 'react';
import Icon from '../../../components/AppIcon';

const ReceiveModal = ({ isOpen, onClose, account, fullName }) => {
  if (!isOpen || !account) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could trigger a small "Copied!" toast here if desired
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-accent text-accent-foreground flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="Download" size={20} />
            <h3 className="font-black uppercase tracking-tighter">Inbound Details</h3>
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
            {/* Account Number Field */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-border group relative">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Account Number</p>
              <div className="flex justify-between items-center">
                <span className="font-mono text-lg font-bold tracking-wider">
                  {account?.account_number}
                </span>
                <button 
                  onClick={() => copyToClipboard(account?.account_number)}
                  className="p-2 hover:bg-accent/10 rounded-lg text-accent transition-colors"
                >
                  <Icon name="Copy" size={18} />
                </button>
              </div>
            </div>

            {/* Bank Name Field */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Bank Name</p>
              <p className="font-bold text-foreground">Sterling Archer Trust</p>
            </div>

            {/* Account Type Field */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Account Type</p>
              <p className="font-bold text-foreground">{account?.type || 'Standard'} Vault</p>
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-2xl border border-accent/20 flex gap-4 items-start">
            <Icon name="Info" size={20} className="text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Direct deposits are processed instantly. Please ensure the sender uses the correct account number to avoid delays in vault hydration.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveModal;