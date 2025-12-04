import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense';
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend,
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-lg",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-2xl lg:text-3xl font-bold",
              variant === 'income' && "text-income",
              variant === 'expense' && "text-destructive"
            )}>
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-income" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === 'default' && "bg-primary/10 text-primary",
            variant === 'income' && "bg-income/10 text-income",
            variant === 'expense' && "bg-destructive/10 text-destructive"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
