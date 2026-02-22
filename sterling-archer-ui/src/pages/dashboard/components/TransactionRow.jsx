import React from 'react';
import Icon from '../../../components/AppIcon';

const TransactionRow = ({ transaction, currentUserAccountNos = [] }) => {
  const currency = transaction?.currency || 'USD';
  const txDate = transaction?.created_at;

  // Mister, this is the CRITICAL check:
  // Is the sender of this transaction one of YOUR account numbers?
  const isOutgoing = currentUserAccountNos.includes(String(transaction?.sender_no));
  
  // Logic-driven styles
  const amountColor = isOutgoing ? 'text-error' : 'text-success';
  const iconColor = isOutgoing ? 'var(--color-error)' : 'var(--color-success)';
  const iconBg = isOutgoing ? 'bg-error/10' : 'bg-success/10';
  const iconName = isOutgoing ? 'ArrowUpRight' : 'ArrowDownLeft';
  const prefix = isOutgoing ? '-' : '+';

  const rawAmount = Math.abs(parseFloat(transaction?.amount || 0));

  const formatCurrency = (amount, curr) => {
    try {
      if (['USDT', 'BTC', 'ETH'].includes(curr)) {
        return `${new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8
        }).format(amount)} ${curr}`;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
      }).format(amount);
    } catch (e) {
      return `${amount.toFixed(2)} ${curr}`;
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBg}`}>
            <Icon name={iconName} size={18} color={iconColor} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {transaction?.reference}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded uppercase">
          {transaction?.transfer_type}
        </span>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-foreground">
          {txDate ? new Date(txDate).toLocaleDateString() : 'N/A'}
        </p>
        <p className="text-xs text-muted-foreground caption">
          {txDate ? new Date(txDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
        </p>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
        {/* Mister, the Red/Green paint is applied here! */}
        <p className={`text-sm font-bold ${amountColor}`}>
          {prefix}{formatCurrency(rawAmount, currency)}
        </p>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
        <p className="text-sm font-medium text-muted-foreground/50">
          {formatCurrency(rawAmount, currency)}
        </p>
      </td>
    </tr>
  );
};

export default TransactionRow;