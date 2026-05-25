import React, { useState } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';

const AccountLedger = ({ transactions = [], loading, accountIdentifier }) => {
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleRowClick = async (txId) => {
    try {
      setModalLoading(true);
      // Call the specific receipt endpoint from backend routes
      const response = await api.get(`/transactions/${txId}/receipt`);
      setSelectedTx(response.data);
    } catch (error) {
      console.error("The receipt retrieval failed:", error);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <div className="h-64 bg-card animate-pulse rounded-3xl" />;

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden relative">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-heading font-semibold">Transaction History</h3>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {transactions.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => {
              const ids = Array.isArray(accountIdentifier) ? accountIdentifier : [accountIdentifier];
              const isDebit = ids.some(id => id && String(tx.sender_no) === String(id));
              return (
                <tr
                  key={tx.id}
                  onClick={() => handleRowClick(tx.id)}
                  className="hover:bg-accent/5 cursor-pointer transition-all group active:scale-[0.98]"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium group-hover:text-accent">
                        {tx.transfer_type.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground truncate w-20">
                        {tx.reference}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tx.status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${isDebit ? 'text-destructive' : 'text-success'}`}>
                    {isDebit ? '-' : '+'}{tx.currency === 'BTC' ? '' : '$'}
                    {tx.currency === 'BTC' 
                      ? Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 }) 
                      : Number(tx.amount).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------------------- TRANSACTION RECEIPT MODAL -------------------- */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-accent text-accent-foreground flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icon name="FileText" size={24} />
                <h4 className="font-bold uppercase tracking-tighter">Transaction Receipt</h4>
              </div>
              <button onClick={() => setSelectedTx(null)} className="hover:rotate-90 transition-transform">
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center pb-6 border-b border-dashed border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Amount</p>
                <h2 className="text-4xl font-heading font-black">
                  {selectedTx.currency === 'BTC' 
                    ? Number(selectedTx.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 }) 
                    : `$${Number(selectedTx.amount).toLocaleString()}`}
                </h2>
                <p className="text-xs text-success font-bold mt-2">● {selectedTx.status.toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Reference</p>
                  <p className="font-mono text-xs">{selectedTx.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Date & Time</p>
                  <p className="text-xs">{formatDate(selectedTx.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Processing Fee</p>
                  <p className="text-xs">${Number(selectedTx.fee).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Vault ID</p>
                  <p className="text-xs">{selectedTx.sender_account_id}</p>
                </div>
              </div>

              {selectedTx.external_info && (
                <div className="bg-muted/50 p-4 rounded-xl border border-border">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1">Destination Details</p>
                  <p className="text-xs italic">{selectedTx.external_info}</p>
                </div>
              )}

              <button
                onClick={() => window.print()}
                className="w-full py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Icon name="Printer" size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLedger;