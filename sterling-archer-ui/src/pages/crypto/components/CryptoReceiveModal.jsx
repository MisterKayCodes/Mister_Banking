import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { QRCodeSVG } from 'qrcode.react';

const CryptoReceiveModal = ({ isOpen, onClose, account, fullName }) => {
  const [activeTab, setActiveTab] = useState('BTC');

  if (!isOpen || !account) return null;

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    // Logic for a "Copied" toast can be triggered here
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-[340px] sm:max-w-sm rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Bitcoin Orange for Crypto Context */}
        <div className="p-4 bg-[#F7931A] text-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Icon name="Download" size={18} />
            <h3 className="text-sm font-black uppercase tracking-tighter">Inbound Digital Assets</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Beneficiary Name</p>
            <h2 className="text-lg font-heading font-bold">{fullName || 'Verified Citizen'}</h2>
          </div>

          <div className="flex bg-muted p-1 rounded-2xl w-full max-w-[200px] mx-auto">
            {['BTC', 'USDT'].map((symbol) => (
              <button
                key={symbol}
                type="button"
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-xl transition-all ${activeTab === symbol
                  ? 'bg-card text-foreground shadow-md scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => setActiveTab(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>

          <div className="flex justify-center items-center bg-white rounded-3xl w-32 h-32 mx-auto shadow-inner border border-border/50">
            <QRCodeSVG
              value={activeTab === 'BTC' ? account?.btc_address || '' : account?.usdt_address || ''}
              size={100}
              level="M"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>

          <div className="space-y-3">
            {activeTab === 'BTC' ? (
              <div className="bg-muted/50 p-3 rounded-2xl border border-border group relative">
                <p className="text-[10px] font-bold uppercase text-[#F7931A] mb-1 font-black">Bitcoin Address (BTC)</p>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-mono text-[11px] sm:text-xs font-bold tracking-tight text-foreground break-all leading-tight">
                    {account?.btc_address || 'Address Not Generated'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account?.btc_address)}
                    className="p-1.5 bg-card hover:bg-[#F7931A]/10 rounded-xl text-[#F7931A] transition-colors border border-border shrink-0 shadow-sm"
                    title="Copy BTC Address"
                  >
                    <Icon name="Copy" size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 p-3 rounded-2xl border border-border group relative">
                <p className="text-[10px] font-bold uppercase text-[#26A17B] mb-1 font-black">Tether Address (USDT)</p>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-mono text-[11px] sm:text-xs font-bold tracking-tight text-foreground break-all leading-tight">
                    {account?.usdt_address || 'Address Not Generated'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account?.usdt_address)}
                    className="p-1.5 bg-card hover:bg-[#26A17B]/10 rounded-xl text-[#26A17B] transition-colors border border-border shrink-0 shadow-sm"
                    title="Copy USDT Address"
                  >
                    <Icon name="Copy" size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Network Note */}
            <div className="bg-muted/50 p-2.5 rounded-2xl border border-border">
              <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 tracking-widest text-center">Supported Network</p>
              <p className="font-bold text-foreground text-center text-[10px] uppercase">Bitcoin Core / Ethereum (ERC-20)</p>
            </div>
          </div>

          <div className="bg-accent/5 p-3 rounded-2xl border border-accent/20 flex gap-3 items-start">
            <Icon name="ShieldCheck" size={16} className="text-accent shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Blockchain transfers are permanent. Please verify the network before sending. Funds are typically credited after 3 network confirmations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 border border-border text-foreground rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all active:scale-[0.98]"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div >
  );
};

export default CryptoReceiveModal;