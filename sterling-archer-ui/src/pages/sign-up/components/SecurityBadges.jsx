import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Bank-Grade Security',
      description: '256-bit SSL encryption protects your data'
    },
    {
      icon: 'Lock',
      title: 'FDIC Insured',
      description: 'Your deposits are insured up to $250,000'
    },
    {
      icon: 'CheckCircle',
      title: 'Regulatory Compliance',
      description: 'Fully compliant with banking regulations'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {securityFeatures?.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 mb-3">
              <Icon name={feature?.icon} size={20} color="var(--color-success)" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {feature?.title}
            </h3>
            <p className="text-xs text-muted-foreground caption">
              {feature?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBadges;