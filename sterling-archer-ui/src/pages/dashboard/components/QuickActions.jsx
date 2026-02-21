import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 'transfer',
      label: 'Transfer Funds',
      icon: 'ArrowLeftRight',
      description: 'Send money between accounts',
      color: 'var(--color-accent)'
    },
    {
      id: 'crypto',
      label: 'Buy Crypto',
      icon: 'Bitcoin',
      description: 'Purchase digital assets',
      color: 'var(--color-success)'
    },
    {
      id: 'kyc',
      label: 'Verify Identity',
      icon: 'ShieldCheck',
      description: 'Complete KYC verification',
      color: 'var(--color-primary)'
    },
    {
      id: 'support',
      label: 'Get Support',
      icon: 'MessageCircle',
      description: 'Chat with our team',
      color: 'var(--color-warning)'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
          Quick Actions
        </h2>
        <Icon name="Zap" size={24} color="var(--color-accent)" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onActionClick(action?.id)}
            className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-smooth text-left"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted flex-shrink-0">
              <Icon name={action?.icon} size={24} color={action?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-heading font-semibold text-foreground mb-1">
                {action?.label}
              </h3>
              <p className="text-xs text-muted-foreground caption line-clamp-2">
                {action?.description}
              </p>
            </div>
            <Icon name="ChevronRight" size={20} color="var(--color-muted-foreground)" className="flex-shrink-0 mt-2" />
          </button>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          fullWidth
          onClick={() => onActionClick('more')}
        >
          View All Services
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;