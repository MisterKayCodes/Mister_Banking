import React from 'react';
import Icon from '../../../components/AppIcon';

const ActionGrid = ({ onAction, customActions }) => {
  const defaultActions = [
    { id: 'send', label: 'Send Funds', icon: 'ArrowUpRight', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'receive', label: 'Receive', icon: 'ArrowDownLeft', color: 'bg-green-500/10 text-green-500' },
    { id: 'exchange', label: 'Buy Crypto', icon: 'RefreshCw', color: 'bg-accent/10 text-accent' },
    { id: 'statement', label: 'Statement', icon: 'FileText', color: 'bg-muted/50 text-muted-foreground' },
  ];

  const actions = customActions || defaultActions;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-accent/40 hover:shadow-warm-md transition-smooth group"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${action.color}`}>
            <Icon name={action.icon} size={24} />
          </div>
          <span className="text-sm font-semibold text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ActionGrid;