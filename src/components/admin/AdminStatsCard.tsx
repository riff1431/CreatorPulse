import React from 'react';
import { Card } from '@/components/ui/Card';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendColor = 'text-cyan-400',
}) => {
  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      {trend && (
        <div className={`text-[10px] ${trendColor} font-medium`}>{trend}</div>
      )}
    </Card>
  );
};
