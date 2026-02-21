import React from 'react';
import Icon from '../../../components/AppIcon';

const TransactionRow = ({ transaction }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'internal':
        return 'ArrowLeftRight';
      case 'external':
        return 'Send';
      case 'buy':
        return 'TrendingUp';
      case 'sell':
        return 'TrendingDown';
      default:
        return 'DollarSign';
    }
  };

  const getTransactionBadge = (type) => {
    const badges = {
      internal: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        label: 'Internal'
      },
      external: {
        bg: 'bg-accent/10',
        text: 'text-accent',
        label: 'External'
      },
      buy: {
        bg: 'bg-success/10',
        text: 'text-success',
        label: 'Buy'
      },
      sell: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        label: 'Sell'
      }
    };

    const badge = badges?.[type?.toLowerCase()] || badges?.internal;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${badge?.bg} ${badge?.text} text-xs font-medium rounded-lg caption`}>
        <Icon name={getTransactionIcon(type)} size={12} color="currentColor" />
        {badge?.label}
      </span>
    );
  };

  const isPositive = transaction?.amount > 0;

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
            isPositive ? 'bg-success/10' : 'bg-error/10'
          }`}>
            <Icon 
              name={isPositive ? 'ArrowDownLeft' : 'ArrowUpRight'} 
              size={18} 
              color={isPositive ? 'var(--color-success)' : 'var(--color-error)'} 
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {transaction?.description}
            </p>
            <p className="text-xs text-muted-foreground caption mt-1">
              {transaction?.reference}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        {getTransactionBadge(transaction?.type)}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <div>
          <p className="text-sm text-foreground">{formatDate(transaction?.date)}</p>
          <p className="text-xs text-muted-foreground caption mt-1">{formatTime(transaction?.date)}</p>
        </div>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
        <p className={`text-sm font-semibold ${
          isPositive ? 'text-success' : 'text-error'
        }`}>
          {isPositive ? '+' : '-'}{formatCurrency(transaction?.amount, transaction?.currency)}
        </p>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
        <p className="text-sm font-medium text-foreground">
          {formatCurrency(transaction?.balance, transaction?.currency)}
        </p>
      </td>
    </tr>
  );
};

export default TransactionRow;