import React from 'react';
import { RiskBadgeType } from '../types';

interface Props {
  badge: RiskBadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadgeDisplay: React.FC<Props> = ({ badge, size = 'md' }) => {
  const getBadgeConfig = (b: RiskBadgeType) => {
    switch (b) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL RISK',
          classes: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/50'
        };
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/50'
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM RISK',
          classes: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-950/50'
        };
      case 'LOW':
      default:
        return {
          label: 'LOW RISK',
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/50'
        };
    }
  };

  const config = getBadgeConfig(badge);
  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 tracking-wider',
    md: 'text-xs px-3 py-1 tracking-wider',
    lg: 'text-xs px-3.5 py-1.5 tracking-wider font-bold'
  }[size];

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${config.classes} ${sizeClasses} font-mono uppercase whitespace-nowrap shrink-0`}>
      {config.label}
    </span>
  );
};
