import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustIndicators = () => {
  const indicators = [
    {
      id: 1,
      icon: 'Award',
      text: 'Trusted by 50,000+ customers'
    },
    {
      id: 2,
      icon: 'Globe',
      text: 'Operating since 2015'
    },
    {
      id: 3,
      icon: 'TrendingUp',
      text: '$2.5B+ assets under management'
    }
  ];

  return (
    <div className="mt-6 space-y-3">
      {indicators?.map((indicator) => (
        <div
          key={indicator?.id}
          className="flex items-center gap-3 text-sm text-muted-foreground caption"
        >
          <Icon name={indicator?.icon} size={16} color="var(--color-accent)" />
          <span>{indicator?.text}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;