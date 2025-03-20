import { ReactNode } from "react";

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: number;
  }
 export interface PerformanceBadgeProps {
    name?: string;
    avatar?: string;
    metric?: number;
    rank: number;
  }

export  interface ChartCardProps {
    title: string;
    children: ReactNode;
    height?: number;
  }

