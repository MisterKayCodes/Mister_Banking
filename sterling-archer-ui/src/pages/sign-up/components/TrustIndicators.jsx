import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustIndicators = () => {
  const indicators = [
    {
      icon: 'ShieldCheck',
      text: 'SOC 2 Type II Certified',
      color: 'text-success'
    },
    {
      icon: 'Lock',
      text: 'PCI DSS Compliant',
      color: 'text-success'
    },
    {
      icon: 'Award',
      text: 'ISO 27001 Certified',
      color: 'text-success'
    }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6">
      {indicators?.map((indicator, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border"
        >
          <Icon name={indicator?.icon} size={16} color="var(--color-success)" />
          <span className="text-xs font-medium text-muted-foreground caption whitespace-nowrap">
            {indicator?.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;