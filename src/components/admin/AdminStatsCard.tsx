import React from 'react';
import { Card } from '@/components/admin/ui/Card';

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
  trendColor = 'text-indigo-600',
}) => {
  return (
    <Card className="p-5 space-y-2">
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-bold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-slate-800">{value}</div>
      {trend && (
        <div className={`text-[10px] ${trendColor} font-bold`}>{trend}</div>
      )}
    </Card>
  );
};
