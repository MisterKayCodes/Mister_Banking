import React from 'react';
import Icon from '../../../components/AppIcon';

const CryptoLedger = ({ transactions, loading, accountIdentifier }) => {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset / Type</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Value</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                const isIncoming = String(tx.receiver_no) === String(accountIdentifier);
                return (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isIncoming ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          <Icon name={isIncoming ? 'ArrowDownLeft' : 'ArrowUpRight'} size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {tx.crypto_symbol || 'BTC'}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">
                            {tx.type || 'Transfer'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-mono text-foreground truncate max-w-[120px]">
                        {tx.transaction_hash || tx.reference_no}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right font-mono">
                      <p className={`text-xs font-bold ${isIncoming ? 'text-success' : 'text-foreground'}`}>
                        {isIncoming ? '+' : '-'}{tx.amount}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        ~ ${tx.amount_usd?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="px-2 py-1 bg-success/10 text-success text-[9px] font-black uppercase rounded border border-success/20">
                          Confirmed
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-xs text-muted-foreground italic">
                  No blockchain activity detected for this vault.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoLedger;