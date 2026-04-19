import { VIPPlan } from './types';

export const VIP_PLANS: VIPPlan[] = [
  { id: 1, name: 'VIP 1', price: 700, dailyEarning: 36, tasksPerDay: 3, withdrawalStart: '09:00', withdrawalEnd: '18:00' },
  { id: 2, name: 'VIP 2', price: 4000, dailyEarning: 250, tasksPerDay: 3, withdrawalStart: '08:00', withdrawalEnd: '20:00' },
  { id: 3, name: 'VIP 3', price: 12000, dailyEarning: 900, tasksPerDay: 5, withdrawalStart: '07:00', withdrawalEnd: '22:00' },
  { id: 4, name: 'VIP 4', price: 35000, dailyEarning: 2800, tasksPerDay: 6, withdrawalStart: '00:00', withdrawalEnd: '23:59' },
];
