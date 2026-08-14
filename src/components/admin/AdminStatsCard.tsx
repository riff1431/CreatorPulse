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
  trendColor = 'text-[#BE185D]',
}) => {
  return (
    <Card className="p-5 space-y-2.5">
      <div className="flex items-center justify-between text-xs text-[#71717A]">
        <span className="font-bold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-[#18181B]">{value}</div>
      {trend && (
        <div className={`text-[11px] ${trendColor} font-bold`}>{trend}</div>
      )}
    </Card>
  );
};
