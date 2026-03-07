import React from 'react';
import Icon from '../../../components/AppIcon';

const CryptoGrid = ({ onAction }) => {
  const actions = [
    {
      id: 'send',
      label: 'Purchase Asset',
      description: 'Exchange USD for BTC/USDT',
      icon: 'PlusCircle',
      color: 'bg-[#F7931A]/10 text-[#F7931A]',
    },
    {
      id: 'receive',
      label: 'Receive Assets',
      description: 'View wallet deposit addresses',
      icon: 'Download',
      color: 'bg-accent/10 text-accent',
    },
    {
      id: 'swap',
      label: 'Asset Swap',
      description: 'Convert between digital assets',
      icon: 'RefreshCw',
      color: 'bg-success/10 text-success',
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      description: 'Transfer to external wallet',
      icon: 'ArrowUpRight',
      color: 'bg-destructive/10 text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="bg-card border border-border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:border-accent/20 group"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${action.color}`}>
            <Icon name={action.icon} size={24} />
          </div>
          <h4 className="text-sm font-bold text-foreground mb-1">{action.label}</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default CryptoGrid;