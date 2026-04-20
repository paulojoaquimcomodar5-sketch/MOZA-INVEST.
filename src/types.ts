export type Tab = 'home' | 'tasks' | 'vip' | 'team' | 'me' | 'lottery' | 'withdraw' | 'fund' | 'company' | 'support' | 'reports' | 'history' | 'security' | 'settings' | 'chat';

export interface User {
  phone: string;
  inviteCode: string;
  balance: number;
  fundBalance: number;
  totalProfit: number;
  level: string;
  tickets: number;
}

export interface VIPPlan {
  id: number;
  name: string;
  price: number;
  dailyEarning: number;
  tasksPerDay: number;
  taskEarning: number;
  withdrawalStart?: string; // Format "HH:mm"
  withdrawalEnd?: string;   // Format "HH:mm"
}

export interface Task {
  id: string;
  title: string;
  platform: 'YouTube' | 'TikTok' | 'Facebook';
  reward: number;
  videoUrl: string;
  duration: number; // in seconds
}
