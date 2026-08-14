import React from 'react';
import { Card } from '@/components/admin/ui/Card';
import { AdminIcon } from '@/components/admin/ui/AdminIcon';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any> | React.ReactNode;
  trend?: string;
  trendColor?: string;
  variant?: 'neutral' | 'primary' | 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose';
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendColor = 'text-indigo-600',
  variant = 'indigo',
}) => {
  const isComponent = typeof icon === 'function' || (icon && typeof (icon as any).type === 'function');

  return (
    <Card className="p-5 space-y-2 hoverable transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-bold uppercase tracking-wider">{label}</span>
        {isComponent ? (
          <AdminIcon
            icon={icon as React.ComponentType<any>}
            size="sm"
            variant={variant as any}
            container
            gradientAccent
            glow
            rounded="md"
          />
        ) : (
          <div className="admin-icon-container w-8 h-8 admin-icon-rounded-md admin-icon-gradient-blue-indigo admin-icon-glow-indigo flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-slate-800">{value}</div>
      {trend && (
        <div className={`text-[10px] ${trendColor} font-bold`}>{trend}</div>
      )}
    </Card>
  );
};

