import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../api/axios';

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
  const [resolvedName, setResolvedName] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    // Only attempt resolution for internal transfers and exactly 10 digits
    if (formData.transfer_type !== 'internal' || formData.to_account_no.length !== 10) {
      setResolvedName('');
      setResolveError('');
      return;
    }

    const resolveAccount = async () => {
      setIsResolving(true);
      setResolveError('');
      try {
        const response = await api.get(`/accounts/resolve/${formData.to_account_no}`);
        setResolvedName(response.data.owner_name);
      } catch (err) {
        setResolvedName('');
        setResolveError(err.response?.data?.detail || 'Account not found.');
      } finally {
        setIsResolving(false);
      }
    };

    resolveAccount();
  }, [formData.to_account_no, formData.transfer_type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.transfer_type === 'internal' && !resolvedName) {
      setResolveError('Must resolve a valid account before transferring.');
      return;
    }
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
                onClick={() => setFormData({ ...formData, transfer_type: type })}
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            {formData.transfer_type === 'internal' ? (
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Recipient Account</label>
                <input
                  type="text" required maxLength={10}
                  className="w-full bg-muted border-none rounded-2xl p-4 font-mono"
                  placeholder="10-digit number"
                  onChange={(e) => setFormData({ ...formData, to_account_no: e.target.value })}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input className="col-span-2 bg-muted p-4 rounded-2xl" placeholder="Recipient Name" onChange={(e) => setFormData({ ...formData, recipient_full_name: e.target.value })} />
                <input className="bg-muted p-4 rounded-2xl" placeholder="Bank Name" onChange={(e) => setFormData({ ...formData, external_bank_name: e.target.value })} />
                <input className="bg-muted p-4 rounded-2xl" placeholder="SWIFT/BIC" onChange={(e) => setFormData({ ...formData, external_swift_bic: e.target.value })} />
                <input className="col-span-2 bg-muted p-4 rounded-2xl" placeholder="IBAN / Account No" onChange={(e) => setFormData({ ...formData, external_iban_or_acc: e.target.value })} />
              </div>
            )}

            {/* THE RESOLUTION UI BLOCK */}
            {formData.transfer_type === 'internal' && formData.to_account_no.length === 10 && (
              <div className={`p-4 rounded-2xl flex items-center justify-between transition-smooth -mt-2 ${isResolving ? 'bg-muted animate-pulse' :
                  resolveError ? 'bg-error/10 border border-error/20 text-error' :
                    'bg-success/10 border border-success/20 text-success'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isResolving ? 'bg-background' : resolveError ? 'bg-error/20' : 'bg-success/20'}`}>
                    <Icon name={isResolving ? 'Loader' : resolveError ? 'XCircle' : 'CheckCircle2'} className={isResolving ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      {isResolving ? 'Resolving Network...' : resolveError ? 'Verification Failed' : 'Identity Confirmed'}
                    </p>
                    <p className="font-heading font-black truncate max-w-[200px]">
                      {isResolving ? '...' : resolveError || resolvedName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border mt-4">
              <label className="text-[10px] font-bold uppercase text-accent ml-2">Transaction PIN</label>
              <input
                type="password" required maxLength={4}
                className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-4 text-center tracking-[1em] text-2xl font-mono"
                placeholder="****"
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
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