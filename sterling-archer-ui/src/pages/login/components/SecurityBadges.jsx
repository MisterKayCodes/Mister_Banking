import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      id: 1,
      icon: 'ShieldCheck',
      title: '256-bit SSL Encryption',
      description: 'Bank-grade security'
    },
    {
      id: 2,
      icon: 'Lock',
      title: 'FDIC Insured',
      description: 'Up to $250,000'
    },
    {
      id: 3,
      icon: 'CheckCircle',
      title: 'Two-Factor Authentication',
      description: 'Enhanced protection'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {securityFeatures?.map((feature) => (
          <div
            key={feature?.id}
            className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-smooth"
          >
            <div className="flex-shrink-0 mt-1">
              <Icon name={feature?.icon} size={20} color="var(--color-success)" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-1">
                {feature?.title}
              </h4>
              <p className="text-xs text-muted-foreground caption">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBadges;