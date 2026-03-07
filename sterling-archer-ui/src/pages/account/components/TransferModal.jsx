import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TransferModal = ({ isOpen, onClose, onTransfer, isSubmitting, senderAccountNo }) => {
  const [formData, setFormData] = useState({
    to_account_no: '',
    amount: '',
    transfer_type: 'internal',
    pin: '',
    external_bank_name: '',
    external_iban_or_acc: '',
    recipient_full_name: '',
    external_swift_bic: '',
    purpose_of_transfer: 'General'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onTransfer(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-foreground text-background flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tighter">New Transfer</h3>
          <button type="button" onClick={onClose}><Icon name="X" /></button>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex bg-muted p-1 rounded-2xl mb-4">
            {['internal', 'external'].map(type => (
              <button 
                key={type} type="button"
                className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all ${formData.transfer_type === type ? 'bg-card shadow-md text-foreground' : 'opacity-40'}`}
                onClick={() => setFormData({...formData, transfer_type: type})}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Amount</label>
              <input 
                type="number" step="0.01" required 
                className="w-full bg-muted border-none rounded-2xl p-4 font-mono text-xl" 
                placeholder="0.00" 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
              />
            </div>

            {formData.transfer_type === 'internal' ? (
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Recipient Account</label>
                <input 
                  type="text" required maxLength={10} 
                  className="w-full bg-muted border-none rounded-2xl p-4 font-mono" 
                  placeholder="10-digit number" 
                  onChange={(e) => setFormData({...formData, to_account_no: e.target.value})} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input className="col-span-2 bg-muted p-4 rounded-2xl" placeholder="Recipient Name" onChange={(e) => setFormData({...formData, recipient_full_name: e.target.value})} />
                <input className="bg-muted p-4 rounded-2xl" placeholder="Bank Name" onChange={(e) => setFormData({...formData, external_bank_name: e.target.value})} />
                <input className="bg-muted p-4 rounded-2xl" placeholder="SWIFT/BIC" onChange={(e) => setFormData({...formData, external_swift_bic: e.target.value})} />
                <input className="col-span-2 bg-muted p-4 rounded-2xl" placeholder="IBAN / Account No" onChange={(e) => setFormData({...formData, external_iban_or_acc: e.target.value})} />
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <label className="text-[10px] font-bold uppercase text-accent ml-2">Transaction PIN</label>
              <input 
                type="password" required maxLength={6} 
                className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-4 text-center tracking-[1em] text-2xl" 
                placeholder="****" 
                onChange={(e) => setFormData({...formData, pin: e.target.value})} 
              />
            </div>
          </div>

          <button disabled={isSubmitting} className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 mt-4">
            {isSubmitting ? 'Verifying...' : 'Confirm & Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferModal;