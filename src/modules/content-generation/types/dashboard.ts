export interface StatItem {
  label: string;
  value: string;
  change: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  platform: string;
  timestamp: string;
  score: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread?: boolean;
}
