export type Tab = 'home' | 'tasks' | 'vip' | 'team' | 'me' | 'lottery' | 'withdraw' | 'fund' | 'company' | 'support' | 'reports' | 'history' | 'security' | 'settings' | 'chat' | 'mines' | 'loan';

export interface LoanRecord {
  id: string;
  amount: number;
  totalToRepay?: number;
  period?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPAID';
  date: string;
}

export interface User {
  phone: string;
  name: string;
  inviteCode: string;
  balance: number;
  fundBalance: number;
  totalProfit: number;
  level: string;
  tickets: number;
  profileImage?: string;
  loanBalance?: number;
  dailyChallengeBonus?: number;
  lastDailyBonusDate?: string; // YYYY-MM-DD
  loanHistory?: LoanRecord[];
  completedTasksCount?: { [key: string]: number };
  upline?: string; // Phone of the person who invited this user
  invitedCount?: number;
  referralEarnings?: number;
  language?: 'pt' | 'en' | 'ny' | 'zu' | 'tsa';
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
  withdrawalDay?: number;   // 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 0=Domingo
}

export interface Task {
  id: string;
  title: string;
  platform: 'YouTube' | 'TikTok' | 'Facebook';
  reward: number;
  videoUrl: string;
  duration: number; // in seconds
}
