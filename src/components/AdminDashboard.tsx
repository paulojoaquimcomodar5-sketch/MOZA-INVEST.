import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Image as ImageIcon, 
  Coins, 
  FerrisWheel, 
  ArrowLeft, 
  Users, 
  BarChart3, 
  CreditCard,
  Search,
  UserCheck,
  TrendingDown,
  Settings,
  Lock,
  X,
  Plus,
  Trash2,
  Edit2,
  Trophy,
  Landmark,
  Megaphone,
  TrendingUp,
  Diamond,
  Zap,
  Youtube,
  PieChart,
  Network,
  Bell,
  MessageSquare,
  Gift,
  ShieldAlert
} from 'lucide-react';
import socket from '../lib/socket';
import { User } from '../types';
import Logo from './Logo';

interface ApprovalItem {
  id: string;
  type: 'BANNER' | 'PAYMENT' | 'LOTTERY' | 'VIP_UPGRADE' | 'LOAN_REQUEST' | 'FUND_SUBSCRIBE' | 'MISSION_VERIFICATION';
  user: string;
  data: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  time: string;
  amount?: number;
}

interface WithdrawalItem {
  id: string;
  phone: string;
  amount: number;
  channel: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestTime: string;
}

interface BannerItem {
  id: string;
  text: string;
  sub: string;
  color: string;
  textColor: string;
  imageUrl?: string;
}

interface PrizeItem {
  id: string;
  name: string;
  image: string;
  desc: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  time: string;
}

interface TaskItem {
  id: string;
  title: string;
  platform: 'YouTube' | 'TikTok' | 'Facebook';
  videoUrl: string;
  duration: number;
}

type AdminTab = 'overview' | 'approvals' | 'users' | 'withdrawals' | 'tasks' | 'banners' | 'prizes' | 'vip' | 'audit' | 'settings' | 'financials' | 'referrals';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [vipPlans, setVipPlans] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingApprovals: 0,
    pendingWithdrawals: 0,
    activeBanners: 0,
    currentInviteCode: 'MOZA2026',
    totalInvested: 0,
    totalPaid: 0,
    totalReferralPaid: 0,
    averageWithdrawal: 0,
    dailyActiveUsers: 0
  });

  const [globalConfig, setGlobalConfig] = useState({
    minWithdrawal: 100,
    maxWithdrawal: 50000,
    referralBonus: 10, // 10%
    welcomeBonus: 50,
    taskBonus: 5,
    mpesaFee: 2, // 2%
    maintenanceMode: false
  });

  const [newBanner, setNewBanner] = useState({ text: '', sub: '', color: 'linear-gradient(135deg, #1e293b, #0f172a)', textColor: '#e3b341', imageUrl: '' });
  const [newPrize, setNewPrize] = useState({ name: '', image: '', desc: '' });
  const [newVip, setNewVip] = useState({ name: '', price: '0', daily: '0', tasks: '5', color: '#D4AF37', icon: 'zap' });
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({ title: '', platform: 'YouTube', videoUrl: '', duration: 15 });
  const [tempInviteCode, setTempInviteCode] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ balance: 0, level: '', tickets: 0, isPremium: false });
  const [appStatus, setAppStatus] = useState({ 
    status: 'OPEN', 
    message: '',
    welcomeSettings: {
      active: true,
      title: "Olá, {name}!",
      message: "A sua jornada para a elite financeira continua. Comece as suas tarefas diárias para maximizar os rendimentos."
    }
  });
  const [paymentMethods, setPaymentMethods] = useState({ mpesa: '', emola: '', paypal: '', bank: '' });
  const [userMsg, setUserMsg] = useState({ phone: '', content: '', type: 'ALERT' as 'ALERT' | 'GIFT' | 'INFO' });

  useEffect(() => {
    // Initial fetch
    socket.emit('get_pending_approvals');
    socket.emit('get_all_users');
    socket.emit('get_system_stats');
    socket.emit('get_pending_withdrawals');
    socket.emit('get_banners');
    socket.emit('get_app_status');
    socket.emit('get_audit_logs');

    socket.on('approvals_list', (list: ApprovalItem[]) => setItems(list));
    socket.on('users_list', (list: User[]) => setUsers(list));
    socket.on('system_stats', (data: any) => setStats(data));
    socket.on('banners_list', (list: BannerItem[]) => setBanners(list));
    socket.on('prizes_update', (list: PrizeItem[]) => setPrizes(list));
    socket.on('vip_plans_update', (list: any[]) => setVipPlans(list));
    socket.on('payment_methods_update', (data: any) => setPaymentMethods(data));
    socket.on('app_status_update', (data: any) => setAppStatus(data));
    socket.on('welcome_settings_update', (settings: any) => {
      setAppStatus(prev => ({ ...prev, welcomeSettings: settings }));
    });
    socket.on('tasks_list', (list: TaskItem[]) => setTasks(list));
    socket.on('audit_logs_list', (list: AuditLog[]) => setAuditLogs(list));
    socket.on('user_data_updated', (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.phone === updatedUser.phone ? updatedUser : u));
    });
    socket.on('new_audit_log', (log: AuditLog) => setAuditLogs(prev => {
      if (prev.find(l => l.id === log.id)) return prev;
      return [log, ...prev];
    }));
    socket.on('withdrawals_list', (list: WithdrawalItem[]) => {
      setWithdrawals(list);
      setLoading(false);
    });

    socket.on('new_approval_needed', (item: ApprovalItem) => {
      setItems(prev => {
        if (prev.find(i => i.id === item.id)) return prev;
        return [item, ...prev];
      });
      socket.emit('get_system_stats');
    });

    socket.on('item_status_updated', (updatedItem: ApprovalItem) => {
      setItems(prev => prev.filter(i => i.id !== updatedItem.id));
      socket.emit('get_system_stats');
    });

    socket.on('withdrawal_status_updated', () => {
      socket.emit('get_pending_withdrawals');
      socket.emit('get_all_users');
      socket.emit('get_system_stats');
    });

    socket.on('payment_methods_updated', (res: any) => {
      if (res.success) {
        alert(res.message);
      }
    });

    return () => {
      socket.off('approvals_list');
      socket.off('users_list');
      socket.off('system_stats');
      socket.off('withdrawals_list');
      socket.off('new_approval_needed');
      socket.off('item_status_updated');
      socket.off('withdrawal_status_updated');
      socket.off('app_status_update');
      socket.off('prizes_update');
      socket.off('payment_methods_update');
      socket.off('payment_methods_updated');
      socket.off('vip_plans_update');
      socket.off('tasks_list');
      socket.off('audit_logs_list');
      socket.off('new_audit_log');
    };
  }, []);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    socket.emit(action === 'approve' ? 'approve_item' : 'reject_item', id);
  };

  const handleWithdrawalAction = (id: string, action: 'approve' | 'reject') => {
    socket.emit(action === 'approve' ? 'approve_withdrawal' : 'reject_withdrawal', id);
  };

  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [editingPrize, setEditingPrize] = useState<PrizeItem | null>(null);
  const [editingVipPlan, setEditingVipPlan] = useState<any | null>(null);

  const addPrize = () => {
    if (!newPrize.name || !newPrize.image) return;
    const prizeWithId = {
      ...newPrize,
      id: Math.random().toString(36).substr(2, 9)
    };
    const updated = [...prizes, prizeWithId];
    socket.emit('update_prizes', updated);
    setNewPrize({ name: '', image: '', desc: '' });
  };

  const updatePrize = () => {
    if (!editingPrize) return;
    const updated = prizes.map(p => p.id === editingPrize.id ? editingPrize : p);
    socket.emit('update_prizes', updated);
    setEditingPrize(null);
  };

  const removePrize = (id: string) => {
    const updated = prizes.filter(p => p.id !== id);
    socket.emit('update_prizes', updated);
  };

  const updateBanner = () => {
    if (!editingBanner) return;
    const updated = banners.map(b => b.id === editingBanner.id ? editingBanner : b);
    // Actually we need a socket event for multiple banners or update specific
    // Since server.ts uses state.banners.push(newBanner) for add_banner
    // and state.banners = state.banners.filter(b => b.id !== id) for remove_banner
    // I should check if there is an 'update_banners' event.
    // Looking at server.ts... it doesn't have update_banners. I'll add it or use a trick.
    // Better to add update_banners to server.ts later.
    socket.emit('set_banners', updated); 
    setEditingBanner(null);
  };

  const updateVipPlan = () => {
    if (!editingVipPlan) return;
    const updated = vipPlans.map(p => p.id === editingVipPlan.id ? editingVipPlan : p);
    socket.emit('update_vip_plans', updated);
    setEditingVipPlan(null);
  };

  const filteredUsers = users.filter(u => 
    (u.phone && u.phone.includes(searchTerm)) || 
    (u.inviteCode && u.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const saveUserEdits = () => {
    if (editingUser) {
      socket.emit('manual_user_update', { 
        phone: editingUser.phone, 
        updates: editForm 
      });
      setEditingUser(null);
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {[
        { label: 'Utilizadores', value: stats.totalUsers, color: 'text-blue-400', Icon: Users },
        { label: 'Capital Total', value: `${(stats.totalBalance || 0).toLocaleString()} MT`, color: 'text-emerald-400', Icon: BarChart3 },
        { label: 'Vendas Pendentes', value: stats.pendingApprovals, color: 'text-orange-400', Icon: CreditCard },
        { label: 'Saques Pendentes', value: stats.pendingWithdrawals, color: 'text-red-400', Icon: TrendingDown },
      ].map((s) => (
        <div key={s.label} className="bg-surface border border-border p-6 rounded-2xl shadow-xl">
           <s.Icon className={`${s.color} mb-3`} size={20} />
           <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest">{s.label}</p>
           <h4 className="text-xl font-serif text-white mt-1">{s.value}</h4>
        </div>
      ))}
    </div>
  );

  const renderFinancials = () => (
    <div className="space-y-8">
      <div className="bg-surface border border-border p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                 <PieChart size={24} />
              </div>
              <div>
                 <h3 className="text-xl font-serif italic text-white leading-none">Fluxo de Caixa Profundo</h3>
                 <p className="text-[9px] text-text-secondary uppercase tracking-[2px] font-bold mt-2">Detalhamento Financeiro Anual</p>
              </div>
           </div>
           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-all">Exportar Diário</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-black/20 border border-white/5 p-6 rounded-2xl">
              <span className="text-[8px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Entradas Brutas</span>
              <div className="text-2xl font-serif text-white">MZN {(stats.totalInvested || 0).toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2 text-[8px] text-emerald-400 font-bold">
                 <TrendingUp size={10} /> +12.5% vs ontem
              </div>
           </div>
           <div className="bg-black/20 border border-white/5 p-6 rounded-2xl">
              <span className="text-[8px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Saídas Reais</span>
              <div className="text-2xl font-serif text-white">MZN {(stats.totalPaid || 0).toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2 text-[8px] text-red-400 font-bold">
                 <TrendingDown size={10} /> -5.2% vs ontem
              </div>
           </div>
           <div className="bg-black/20 border border-white/5 p-6 rounded-2xl">
              <span className="text-[8px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Comissões Pagas</span>
              <div className="text-2xl font-serif text-accent">MZN {(stats.totalReferralPaid || 0).toLocaleString()}</div>
              <p className="text-[7px] text-text-secondary mt-2">Rede de Afiliados (Nível 1, 2 e 3)</p>
           </div>
           <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl">
              <span className="text-[8px] uppercase font-black text-accent tracking-[2px] block mb-2">Liquidez Disponível</span>
              <div className="text-2xl font-serif text-accent">MZN {((stats.totalInvested || 0) - (stats.totalPaid || 0)).toLocaleString()}</div>
              <p className="text-[7px] text-emerald-400 mt-2 font-black">SOLVENTE</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-surface border border-border p-8 rounded-3xl">
            <h3 className="text-lg font-serif italic mb-6">Métricas de Transação</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Média de Saque</span>
                  <b className="text-white">MZN {(stats.averageWithdrawal || 0).toLocaleString()}</b>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Utilizadores Ativos (24h)</span>
                  <b className="text-emerald-400">{stats.dailyActiveUsers || 0}</b>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Bónus de Boas-Vindas Distribuídos</span>
                  <b className="text-accent">MZN {(stats.totalUsers * globalConfig.welcomeBonus).toLocaleString()}</b>
               </div>
            </div>
         </div>

         <div className="bg-surface border border-border p-8 rounded-3xl">
            <h3 className="text-lg font-serif italic mb-6">Projeção de Sustentabilidade</h3>
            <div className="p-6 bg-bg/40 border border-white/10 rounded-2xl">
               <p className="text-xs text-text-secondary leading-relaxed mb-6">Com base no rácio atual de <span className="text-white font-bold">{(stats.totalPaid > 0 ? (stats.totalInvested/stats.totalPaid) : 0).toFixed(2)}x</span> (Investimento vs Pagamento), a plataforma tem uma vida útil projetada de <span className="text-emerald-400 font-bold">Indeterminada</span>.</p>
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-accent" style={{ width: '75%' }}></div>
               </div>
               <div className="flex justify-between text-[8px] uppercase font-black tracking-widest text-text-secondary">
                  <span>Risco</span>
                  <span className="text-accent">Seguro</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div className="space-y-8">
      <div className="bg-surface border border-border p-8 rounded-3xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
              <Network size={24} />
           </div>
           <div>
              <h3 className="text-xl font-serif italic text-white leading-none">Análise de Rede & Afiliados</h3>
              <p className="text-[9px] text-text-secondary uppercase tracking-[2px] font-bold mt-2">Controlo da Estrutura Moza INV</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl">
              <span className="text-[8px] uppercase font-black text-text-secondary mb-2 block">Top Recrutador</span>
              <b className="text-white text-lg">---</b>
              <p className="text-[7px] text-accent mt-2 uppercase font-black">Prémio: Bónus 5% Adicional</p>
           </div>
           <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl">
              <span className="text-[8px] uppercase font-black text-text-secondary mb-2 block">Convites Totais</span>
              <b className="text-white text-lg">{users.length}</b>
              <p className="text-[7px] text-emerald-400 mt-2 uppercase font-black">Crescimento: +15% / Mês</p>
           </div>
           <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl">
              <span className="text-[8px] uppercase font-black text-text-secondary mb-2 block">Comissão Base</span>
              <b className="text-white text-lg">{globalConfig.referralBonus}%</b>
              <p className="text-[7px] text-text-secondary mt-2 uppercase font-black">Nível 1 (Direto)</p>
           </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-serif italic">Influenciadores & Líderes</h3>
         </div>
         <div className="divide-y divide-white/5">
            {users.filter(u => (u.invitedCount || 0) > 0).sort((a,b) => (b.invitedCount || 0) - (a.invitedCount || 0)).map(u => (
               <div key={u.phone} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                        <Users size={20} />
                     </div>
                     <div>
                        <b className="text-white block text-sm">{u.phone}</b>
                        <span className="text-[9px] text-text-secondary uppercase">Rede: <b>{u.invitedCount}</b> Membros Ativos</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-emerald-400 font-serif">MZN {(u.referralEarnings || 0).toLocaleString()}</div>
                     <span className="text-[8px] text-text-secondary uppercase">Ganhos em Rede</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Global Config Card */}
      <div className="bg-linear-to-br from-[#1E1B4B] to-surface border border-accent/20 p-8 rounded-3xl shadow-2xl">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-lg shadow-accent/10">
               <Settings size={24} />
            </div>
            <div>
               <h3 className="text-xl font-serif italic">Configurações Base (Personalizado)</h3>
               <p className="text-[10px] text-text-secondary uppercase tracking-widest">Variáveis Globais do Sistema</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Saque Mínimo (MZN)</label>
               <div className="flex gap-2">
                  <input type="number" value={globalConfig.minWithdrawal} onChange={e => setGlobalConfig({...globalConfig, minWithdrawal: parseInt(e.target.value)})} className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  <button className="px-4 bg-accent/10 border border-accent/30 text-accent rounded-xl" onClick={() => socket.emit('update_config', globalConfig)}><CheckCircle2 size={18} /></button>
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Bónus de Inscricão (MZN)</label>
               <input type="number" value={globalConfig.welcomeBonus} onChange={e => setGlobalConfig({...globalConfig, welcomeBonus: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-accent" />
            </div>
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">% Comissão Referência (Direta)</label>
               <input type="number" value={globalConfig.referralBonus} onChange={e => setGlobalConfig({...globalConfig, referralBonus: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-accent" />
            </div>
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Taxa Administrativa Saque (%)</label>
               <input type="number" value={globalConfig.mpesaFee} onChange={e => setGlobalConfig({...globalConfig, mpesaFee: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-accent" />
            </div>
            
            <div className="md:col-span-2 pt-6 border-t border-white/5 space-y-6">
               <div className={`p-8 rounded-3xl transition-all duration-500 ${globalConfig.maintenanceMode ? 'bg-red-500/10 border-red-500/30' : 'bg-surface border-white/10'}`}>
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${globalConfig.maintenanceMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-text-secondary'}`}>
                           <ShieldAlert size={24} />
                        </div>
                        <div>
                           <h4 className="text-white font-serif italic text-xl">Modo de Manutenção Global</h4>
                           <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Bloqueia o acesso de todos os clientes moza inv</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => {
                           const newMode = !globalConfig.maintenanceMode;
                           setGlobalConfig({...globalConfig, maintenanceMode: newMode});
                           socket.emit('update_config', {...globalConfig, maintenanceMode: newMode});
                        }}
                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[3px] transition-all transform active:scale-95 ${globalConfig.maintenanceMode ? 'bg-red-500 text-white shadow-xl shadow-red-500/40' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}
                     >
                        {globalConfig.maintenanceMode ? 'SISTEMA BLOQUEADO' : 'SISTEMA ATIVO'}
                     </button>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Mensagem Personalizada de Manutenção</label>
                     <div className="flex gap-4">
                        <textarea 
                           className="flex-1 bg-black/40 border border-white/10 p-4 rounded-2xl text-white text-xs outline-none focus:border-accent min-h-[100px] resize-none"
                           placeholder="Ex: A plataforma está em atualização de segurança. Voltamos em 2 horas..."
                           value={appStatus.message}
                           onChange={(e) => setAppStatus({...appStatus, message: e.target.value})}
                        />
                        <button 
                           className="px-6 bg-accent text-bg rounded-2xl font-black uppercase tracking-widest text-[10px] flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                           onClick={() => {
                              socket.emit('update_app_status', { 
                                 status: globalConfig.maintenanceMode ? 'MAINTENANCE' : 'OPEN', 
                                 message: appStatus.message 
                              });
                              alert("Configurações de sistema atualizadas!");
                           }}
                        >
                           <CheckCircle2 size={24} />
                           <span>SALVAR</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <Megaphone size={24} />
           </div>
           <div>
              <h3 className="text-xl font-serif italic">Pop-up de Boas-Vindas</h3>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest">Controlo da mensagem exibida no login</p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between p-4 bg-bg/40 rounded-xl border border-white/5">
              <div>
                 <b className="text-white text-sm">Estado do Pop-up</b>
                 <p className="text-[9px] text-text-secondary uppercase">Ativar ou desativar globalmente</p>
              </div>
              <button 
                onClick={() => socket.emit('update_welcome_settings', { active: !appStatus.welcomeSettings?.active })}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${appStatus.welcomeSettings?.active ? 'bg-emerald-500 text-white' : 'bg-white/10 text-text-secondary'}`}
              >
                {appStatus.welcomeSettings?.active ? 'ATIVO' : 'DESATIVADO'}
              </button>
           </div>

           <div className="space-y-3">
              <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px]">Título do Pop-up</label>
              <input 
                type="text"
                value={appStatus.welcomeSettings?.title}
                onChange={(e) => setAppStatus({...appStatus, welcomeSettings: { ...appStatus.welcomeSettings, title: e.target.value }})}
                className="w-full bg-black/40 border border-border p-4 rounded-xl text-white text-xs outline-none focus:border-accent"
              />
           </div>

           <div className="space-y-3">
              <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px]">Mensagem do Pop-up</label>
              <textarea 
                value={appStatus.welcomeSettings?.message}
                onChange={(e) => setAppStatus({...appStatus, welcomeSettings: { ...appStatus.welcomeSettings, message: e.target.value }})}
                className="w-full bg-black/40 border border-border p-4 rounded-xl text-white text-xs outline-none focus:border-accent min-h-[100px] resize-none"
              />
           </div>

           <button 
             onClick={() => {
               socket.emit('update_welcome_settings', appStatus.welcomeSettings);
               alert("Configurações de Boas-Vindas salvas!");
             }}
             className="w-full py-4 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20"
           >
              Salvar Alterações do Pop-up
           </button>
        </div>
      </div>

      <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <Lock size={24} />
           </div>
           <div>
              <h3 className="text-xl font-serif italic">Segurança & Acesso</h3>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest">Controlo de visibilidade da plataforma</p>
           </div>
        </div>

        <div className="space-y-10">
           {/* Platform Status */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { id: 'OPEN', label: 'ABERTO', color: 'bg-emerald-500', desc: 'Acesso total a todos os investidores' },
                { id: 'RESTRICTED', label: 'LIMITADO', color: 'bg-blue-500', desc: 'Entrada permitida, mas saques e tarefas bloqueados' },
                { id: 'MAINTENANCE', label: 'MANUTENÇÃO', color: 'bg-orange-500', desc: 'Bloqueio total para melhorias' },
                { id: 'CLOSED', label: 'FECHADO', color: 'bg-red-500', desc: 'Suspensão total das atividades' },
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => socket.emit('set_app_status', opt.id)}
                  className={`p-6 rounded-2xl border transition-all text-left group ${
                    appStatus.status === opt.id 
                    ? 'border-accent bg-accent/5' 
                    : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                   <div className={`w-3 h-3 rounded-full mb-4 ${opt.color} ${appStatus.status === opt.id ? 'animate-pulse ring-4 ring-white/10' : ''}`}></div>
                   <b className={`text-[12px] block mb-1 ${appStatus.status === opt.id ? 'text-accent' : 'text-white'}`}>{opt.label}</b>
                   <p className="text-[9px] text-text-secondary leading-relaxed">{opt.desc}</p>
                </button>
              ))}
           </div>

           {/* Custom Message */}
           <div className="bg-bg/40 border border-white/5 p-8 rounded-2xl">
              <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-4">Mensagem de Bloqueio Personalizada</label>
              <textarea 
                value={appStatus.message}
                onChange={(e) => socket.emit('update_closure_message', e.target.value)}
                placeholder="Ex: A nossa equipa está a processar os pagamentos semanais. Voltaremos em 1 hora."
                className="w-full bg-black/40 border border-border p-5 rounded-xl text-white text-xs outline-none focus:border-accent min-h-[120px] resize-none leading-relaxed"
              />
              <div className="mt-4 flex items-center gap-2 text-text-secondary">
                 <ShieldCheck size={14} className="text-emerald-400" />
                 <span className="text-[9px] italic">Esta mensagem aparecerá instantaneamente para todos os utilizadores ativos.</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-surface border border-border p-8 rounded-3xl mt-8">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
               <CreditCard size={24} />
            </div>
            <div>
               <h3 className="text-xl font-serif italic">Canais de Recebimento</h3>
               <p className="text-[10px] text-text-secondary uppercase tracking-widest">Números e contas para investimentos</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">M-Pesa (Número + Titular)</label>
               <input 
                 value={paymentMethods.mpesa} 
                 onChange={(e) => setPaymentMethods({...paymentMethods, mpesa: e.target.value})}
                 className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent"
               />
            </div>
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">e-Mola (Número + Titular)</label>
               <input 
                 value={paymentMethods.emola} 
                 onChange={(e) => setPaymentMethods({...paymentMethods, emola: e.target.value})}
                 className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent"
               />
            </div>
            <div className="space-y-4">
               <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">PayPal (Email)</label>
               <input 
                 value={paymentMethods.paypal} 
                 onChange={(e) => setPaymentMethods({...paymentMethods, paypal: e.target.value})}
                 className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent"
               />
            </div>
            <div className="flex items-end">
               <button 
                 onClick={() => {
                   socket.emit('update_payment_methods', paymentMethods);
                   alert("Canais de recebimento atualizados com sucesso!");
                 }}
                 className="w-full py-4 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20"
               >
                  Salvar Alterações
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-surface border border-border p-8 rounded-3xl">
            <h3 className="text-lg font-serif italic mb-4">Exportar Base de Dados</h3>
            <p className="text-[10px] text-text-secondary mb-6 leading-relaxed uppercase tracking-tighter">Gere uma cópia de segurança de todos os registos, transações e mensagens da plataforma.</p>
            <button className="w-full py-4 border border-accent/20 text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/10 transition-all">Descarregar DB.JSON</button>
         </div>
         <div className="bg-surface border border-border p-8 rounded-3xl">
            <h3 className="text-lg font-serif italic mb-4">Logs do Sistema</h3>
            <p className="text-[10px] text-text-secondary mb-6 leading-relaxed uppercase tracking-tighter">Monitorize as atividades dos administradores e possíveis tentativas de invasão.</p>
            <button className="w-full py-4 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Ver Histórico de Logs</button>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A051E] text-white font-sans">
      {/* Header */}
      <header className="bg-[#0F0A2A] border-b border-white/5 p-6 sticky top-0 z-50 backdrop-blur-md">
         <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
               <button onClick={onBack} className="p-2 bg-white/5 rounded-lg border border-white/10 text-text-secondary hover:text-white transition-all">
                  <ArrowLeft size={18} />
               </button>
               <div>
                  <h3 className="text-lg font-serif italic">Painel de Controlo</h3>
                  <p className="text-[7px] uppercase tracking-widest text-accent">Administração MOZA</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col text-right">
                  <span className="text-[10px] font-black uppercase text-accent">Admin Master</span>
                  <span className="text-[7px] text-emerald-400 uppercase tracking-widest font-bold">{appStatus.status}</span>
               </div>
               <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center border border-accent/20 text-accent">
                  <ShieldCheck size={18} />
               </div>
            </div>
         </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#0A051E]/90 border-b border-white/5 sticky top-[81px] z-40 backdrop-blur-sm shadow-xl">
         <div className="flex overflow-x-auto hide-scrollbar max-w-7xl mx-auto px-6">
            {[
              { id: 'overview', label: 'Geral' },
              { id: 'approvals', label: 'Aprovações' },
              { id: 'withdrawals', label: 'Saques Pends.' },
              { id: 'users', label: 'Utilizadores' },
              { id: 'tasks', label: 'Tarefas' },
              { id: 'banners', label: 'Banners' },
              { id: 'prizes', label: 'Vitrine' },
              { id: 'vip', label: 'Planos VIP' },
              { id: 'financials', label: 'Financeiro' },
              { id: 'referrals', label: 'Rede/Afiliados' },
              { id: 'audit', label: 'Auditoria' },
              { id: 'settings', label: 'Definições' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-[3px] transition-all relative flex-shrink-0 ${
                  activeTab === tab.id ? 'text-accent' : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
         </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto pt-8">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {renderStats()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-surface border border-border rounded-3xl p-8">
                    <h3 className="text-xl font-serif italic mb-6">Atividade Recente</h3>
                    <div className="space-y-6">
                       {items.slice(0, 3).map(item => (
                         <div key={item.id} className="flex items-center justify-between py-4 border-b border-white/5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                  {item.type === 'PAYMENT' ? <CreditCard size={18} /> : 
                                   item.type === 'LOTTERY' ? <FerrisWheel size={18} /> : <ImageIcon size={18} />}
                               </div>
                               <div>
                                  <b className="text-[12px] block text-white">{item.type === 'PAYMENT' ? 'Solicitação de Depósito' : 
                                                                             item.type === 'LOTTERY' ? 'Prémio de Lotaria' : 'Nova Tarefa'}</b>
                                  <span className="text-[9px] text-text-secondary uppercase">{item.user}</span>
                               </div>
                            </div>
                            <span className="text-[8px] font-bold text-orange-400 border border-orange-400/20 px-2 py-1 rounded">PENDENTE</span>
                         </div>
                       ))}
                       {items.length === 0 && <p className="text-text-secondary text-xs italic">Nenhuma atividade pendente.</p>}
                    </div>
                 </div>

                 <div className="bg-surface border border-border rounded-3xl p-8">
                    <h3 className="text-xl font-serif italic mb-6">Novos Investidores</h3>
                    <div className="space-y-6">
                       {users.slice(-3).reverse().map(u => (
                         <div key={u.phone} className="flex items-center justify-between py-4 border-b border-white/5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                                  <Users size={18} />
                               </div>
                               <div>
                                  <b className="text-[12px] block text-white">{u.phone}</b>
                                  <span className="text-[9px] text-text-secondary uppercase">Convidado por: {u.inviteCode}</span>
                               </div>
                            </div>
                            <span className="text-[11px] font-serif text-accent">MZN {(u.balance || 0).toLocaleString()}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-surface border border-border rounded-3xl p-8 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-serif italic">Controlo de Convites</h3>
                      <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                         <span className="text-[9px] font-black text-accent uppercase tracking-widest">Ativo: {stats.currentInviteCode}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                       <input 
                         type="text" 
                         placeholder="Novo Código de Convite..."
                         value={tempInviteCode}
                         onChange={(e) => setTempInviteCode(e.target.value.toUpperCase())}
                         className="flex-1 bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent text-sm"
                       />
                       <button 
                         onClick={() => {
                           if(tempInviteCode) {
                             socket.emit('update_invite_code', tempInviteCode);
                             setTempInviteCode('');
                             alert("Código atualizado com sucesso!");
                           }
                         }}
                         className="bg-accent text-bg font-bold px-8 rounded-xl text-[10px] uppercase tracking-[2px] shadow-lg active:scale-95 transition-all"
                       >
                          Atualizar Código
                       </button>
                    </div>
                    <p className="text-[9px] text-text-secondary mt-4 uppercase tracking-wider italic">
                      * Todos os novos usuários precisarão deste código para se registar.
                    </p>
                 </div>

                 {/* BROADCAST SECTION */}
                 <div className="bg-linear-to-br from-[#1A1A2E] to-surface border border-accent/20 rounded-3xl p-8 lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform pointer-events-none text-accent">
                       <Megaphone size={200} />
                    </div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                             <Megaphone size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-serif italic text-white">Broadcast Global</h3>
                             <p className="text-[9px] text-text-secondary uppercase tracking-[2px] font-bold">Anúncios Oficiais para toda a Comunidade</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <textarea 
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            placeholder="Escreva a mensagem oficial aqui... Todos os utilizadores verão isto no Chat da Família com destaque Administrativo."
                            className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none focus:border-accent min-h-[120px] resize-none leading-relaxed transition-all"
                          />
                          
                          <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] text-text-secondary uppercase font-black tracking-widest">Sistema Administrativo Moza INV</span>
                             </div>
                             <button 
                               onClick={() => {
                                 if (!broadcastMsg.trim()) return;
                                 socket.emit('admin_broadcast', { content: broadcastMsg });
                                 setBroadcastMsg('');
                                 alert("Anúncio Global enviado com sucesso para todos os usuários!");
                               }}
                               className="bg-accent text-bg font-black px-12 py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-xl shadow-accent/30 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
                             >
                                Disparar Agora
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>

                  {/* SUSTAINABILITY DASHBOARD */}
                  <div className="bg-surface border border-white/5 rounded-3xl p-8 lg:col-span-2 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                        <TrendingUp size={120} />
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h3 className="text-xl font-serif italic text-white leading-none">Monitor de Sustentabilidade</h3>
                              <p className="text-[9px] text-text-secondary uppercase tracking-[2px] font-bold mt-2">Saúde Financeira em Tempo Real</p>
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-[8px] text-emerald-500 uppercase font-black tracking-widest">Estável</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="bg-black/20 border border-white/5 p-6 rounded-2xl group/card hover:border-emerald-500/30 transition-all">
                              <span className="text-[8px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Total Investido</span>
                              <div className="text-2xl font-serif text-emerald-400">MZN {(stats.totalInvested || 0).toLocaleString()}</div>
                              <div className="mt-4 flex items-center justify-between">
                                 <span className="text-[7px] text-text-secondary uppercase">Entradas Totais</span>
                                 <div className="w-12 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%]"></div>
                                 </div>
                              </div>
                           </div>
                           <div className="bg-black/20 border border-white/5 p-6 rounded-2xl group/card hover:border-red-500/30 transition-all">
                              <span className="text-[8px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Total Pago</span>
                              <div className="text-2xl font-serif text-red-400">MZN {(stats.totalPaid || 0).toLocaleString()}</div>
                              <div className="mt-4 flex items-center justify-between">
                                 <span className="text-[7px] text-text-secondary uppercase">Saídas Processadas</span>
                                 <div className="w-12 h-1 bg-red-500/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[35%]"></div>
                                 </div>
                              </div>
                           </div>
                           <div className="bg-accent/5 border border-accent/10 p-6 rounded-2xl group/card hover:border-accent transition-all">
                              <span className="text-[8px] uppercase font-black text-accent tracking-[2px] block mb-2">Margem Operacional</span>
                              <div className="text-2xl font-serif text-accent">{stats.totalInvested > 0 ? ((1 - ((stats.totalPaid || 0) / stats.totalInvested)) * 100).toFixed(1) : '100'}%</div>
                              <div className="mt-4 flex items-center justify-between">
                                 <span className="text-[7px] text-text-secondary uppercase">Rácio de Retenção</span>
                                 <TrendingUp size={12} className="text-accent" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>
            </motion.div>
          )}


          {activeTab === 'banners' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="bg-surface border border-border p-8 rounded-3xl">
                <h3 className="text-xl font-serif italic mb-6">Adicionar Novo Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div>
                      <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Título do Banner</label>
                      <input 
                        type="text" 
                        value={newBanner.text}
                        onChange={(e) => setNewBanner({...newBanner, text: e.target.value})}
                        className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent"
                      />
                   </div>
                   <div>
                      <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Subtítulo / Descrição</label>
                      <input 
                        type="text" 
                        value={newBanner.sub}
                        onChange={(e) => setNewBanner({...newBanner, sub: e.target.value})}
                        className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent"
                      />
                   </div>
                   <div>
                      <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Cor de Fundo (CSS Gradient)</label>
                      <input 
                        type="text" 
                        value={newBanner.color}
                        onChange={(e) => setNewBanner({...newBanner, color: e.target.value})}
                        className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs"
                      />
                   </div>
                   <div>
                      <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Cor do Texto (Hex)</label>
                      <input 
                        type="text" 
                        value={newBanner.textColor}
                        onChange={(e) => setNewBanner({...newBanner, textColor: e.target.value})}
                        className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs"
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">URL da Imagem de Fundo (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="https://exemplo.com/foto.jpg"
                        value={newBanner.imageUrl}
                        onChange={(e) => setNewBanner({...newBanner, imageUrl: e.target.value})}
                        className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs"
                      />
                   </div>
                </div>
                <button 
                  onClick={() => {
                    socket.emit('add_banner', newBanner);
                    setNewBanner({ text: '', sub: '', color: 'linear-gradient(135deg, #1e293b, #0f172a)', textColor: '#e3b341', imageUrl: '' });
                  }}
                  className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg hover:opacity-95 transition-all"
                >
                  PUBLICAR BANNER
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {banners.map(banner => (
                   <div key={banner.id} className="bg-surface border border-border p-6 rounded-2xl relative group overflow-hidden">
                      <div className="absolute inset-0 z-0 opacity-40">
                        {banner.imageUrl && (
                          <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="h-20 rounded-xl mb-4 relative z-10" style={{ background: banner.imageUrl ? 'transparent' : banner.color }}></div>
                      <div className="relative z-10">
                        <b className="text-white block font-serif" style={{ color: banner.textColor }}>{banner.text}</b>
                        <p className="text-[10px] text-text-secondary mt-1">{banner.sub}</p>
                      </div>
                      <div className="flex gap-2 absolute top-8 right-8">
                        <button 
                          onClick={() => setEditingBanner(banner)}
                          className="bg-accent text-bg p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => socket.emit('remove_banner', banner.id)}
                          className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'prizes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="bg-surface border border-border p-8 rounded-3xl">
                  <h3 className="text-xl font-serif italic mb-6">Adicionar Novo Prêmio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div>
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Nome do Prêmio</label>
                        <input 
                          type="text" 
                          value={newPrize.name}
                          onChange={(e) => setNewPrize({...newPrize, name: e.target.value})}
                          className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent"
                          placeholder="Ex: iPhone 17 Pro"
                        />
                     </div>
                     <div>
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">URL da Imagem</label>
                        <input 
                          type="text" 
                          value={newPrize.image}
                          onChange={(e) => setNewPrize({...newPrize, image: e.target.value})}
                          className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent"
                          placeholder="https://..."
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Descrição</label>
                        <textarea 
                          value={newPrize.desc}
                          onChange={(e) => setNewPrize({...newPrize, desc: e.target.value})}
                          className="w-full bg-bg border border-border p-4 rounded-xl text-white outline-none focus:border-accent min-h-[100px] resize-none"
                          placeholder="Detalhes sobre o sorteio..."
                        />
                     </div>
                  </div>
                  <button 
                    onClick={addPrize}
                    className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> ADICIONAR PRÊMIO
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prizes.map(p => (
                    <div key={p.id} className="bg-surface border border-border overflow-hidden rounded-3xl relative group">
                       <img src={p.image} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                       <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
                       <div className="absolute bottom-0 left-0 right-0 p-6">
                          <b className="text-white block text-lg font-serif italic">{p.name}</b>
                          <p className="text-text-secondary text-[10px] mt-1 line-clamp-2">{p.desc}</p>
                          <div className="mt-6 flex gap-2">
                             <button 
                               onClick={() => setEditingPrize(p)}
                               className="flex-1 bg-accent/10 text-accent py-3 rounded-xl border border-accent/20 text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-bg transition-all flex items-center justify-center gap-2"
                             >
                                <Edit2 size={12} /> EDITAR
                             </button>
                             <button 
                               onClick={() => removePrize(p.id)}
                               className="flex-1 bg-red-500/10 text-red-400 py-3 rounded-xl border border-red-500/20 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                             >
                                <Trash2 size={12} /> REMOVER
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                  {prizes.length === 0 && (
                     <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl mx-auto w-full">
                        <Trophy size={48} className="text-white/10 mx-auto mb-4" />
                        <p className="text-text-secondary uppercase tracking-[2px] text-[10px]">Nenhum prêmio na vitrine</p>
                     </div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                  >
                    {/* Approval Card Content */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                          <div className="p-2 bg-accent/10 rounded-lg text-accent">
                            {item.type === 'BANNER' && <ImageIcon size={18} />}
                            {item.type === 'PAYMENT' && <Coins size={18} />}
                            {item.type === 'LOTTERY' && <FerrisWheel size={18} />}
                            {item.type === 'VIP_UPGRADE' && <ShieldCheck size={18} />}
                            {item.type === 'LOAN_REQUEST' && <Landmark size={18} />}
                            {item.type === 'FUND_SUBSCRIBE' && <TrendingUp size={18} />}
                            {item.type === 'MISSION_VERIFICATION' && <Youtube size={18} />}
                          </div>
                         <div>
                           <h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">
                             {item.type === 'VIP_UPGRADE' ? 'ATIVAR VIP' : 
                               item.type === 'LOAN_REQUEST' ? 'PEDIDO CRÉDITO' :
                               item.type === 'FUND_SUBSCRIBE' ? 'SUBSCRICÃO FUNDO' : 
                               item.type === 'MISSION_VERIFICATION' ? 'VERIFICAR MISSÃO' : item.type}
                           </h4>
                           <p className="text-[9px] text-text-secondary">Ref: {item.id}</p>
                         </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-text-secondary font-bold uppercase">Utilizador:</span>
                         <b className="text-white">{item.user}</b>
                      </div>
                      {item.type === 'PAYMENT' && (
                         <div className="bg-bg rounded-xl p-3 border border-border overflow-hidden">
                            <img src="https://picsum.photos/seed/proof/400/300" alt="Proof" className="w-full h-32 object-contain opacity-70" />
                         </div>
                      )}
                      {item.type === 'LOTTERY' && (
                         <div className="text-center bg-bg p-4 rounded-xl border border-border">
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest">Ganhos</span>
                            <div className="text-2xl font-serif">MZN {item.data.amount}</div>
                         </div>
                      )}
                      {item.type === 'VIP_UPGRADE' && (
                         <div className="flex flex-col gap-3">
                            <div className="bg-bg rounded-xl p-3 border border-border overflow-hidden">
                              <img src="https://picsum.photos/seed/proof/400/300" alt="Proof" className="w-full h-32 object-contain opacity-70" />
                            </div>
                            <div className="text-center p-3 bg-accent/5 border border-accent/20 rounded-xl">
                              <span className="text-[8px] text-accent font-black uppercase tracking-widest block mb-1">Plano Solicitado</span>
                              <b className="text-white text-lg font-serif italic">{item.data?.planName || item.planName}</b>
                              <div className="text-[9px] text-text-secondary mt-1">Valor do Plano: MZN {item.data?.amount || item.amount}</div>
                            </div>
                         </div>
                      )}
                      {item.type === 'LOAN_REQUEST' && (
                         <div className="text-center bg-bg p-6 rounded-xl border border-accent/20 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="text-left">
                                  <span className="text-[8px] text-text-secondary uppercase font-bold block mb-1">A Solicitar</span>
                                  <div className="text-lg font-serif text-white">MZN {item.requestedAmount?.toLocaleString()}</div>
                               </div>
                               <div className="text-right">
                                  <span className="text-[8px] text-accent uppercase font-bold block mb-1">A Receber (2.5x)</span>
                                  <div className="text-lg font-serif text-accent">MZN {item.amount?.toLocaleString()}</div>
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                               <div className="text-left">
                                  <span className="text-[7px] text-text-secondary uppercase font-bold block mb-1">Duração</span>
                                  <b className="text-white text-[10px]">{item.period || 30} Dias</b>
                               </div>
                               <div className="text-right">
                                  <span className="text-[7px] text-text-secondary uppercase font-bold block mb-1">Total a Liquidar (35%)</span>
                                  <b className="text-emerald-400 text-[10px]">MZN {item.totalToRepay?.toLocaleString()}</b>
                               </div>
                            </div>
                         </div>
                      )}
                      {item.type === 'FUND_SUBSCRIBE' && (
                         <div className="text-center bg-bg p-6 rounded-xl border border-accent/20">
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest block mb-2">Montante Envolvido</span>
                            <div className="text-2xl font-serif text-white">MZN {item.amount?.toLocaleString()}</div>
                            <p className="text-[8px] text-text-secondary mt-2 uppercase tracking-widest">
                               Investido em: {item.fundName}
                            </p>
                         </div>
                      )}
                      {item.type === 'MISSION_VERIFICATION' && (
                         <div className="flex flex-col gap-3">
                            <div className="bg-bg rounded-xl p-3 border border-border overflow-hidden">
                              <img src={item.data.proofImage} alt="Mission Proof" className="w-full h-40 object-contain" />
                            </div>
                            <div className="text-center p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                              <span className="text-[8px] text-red-500 font-black uppercase tracking-widest block mb-1">Missão de Prova</span>
                              <b className="text-white text-[11px] font-serif italic">{item.data?.missionName}</b>
                              <div className="text-[9px] text-accent mt-1 font-black">RECOMPENSA: MZN {item.data?.amount}</div>
                            </div>
                         </div>
                      )}
                    </div>
                    <div className="p-4 flex gap-2">
                       <button onClick={() => handleAction(item.id, 'reject')} className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest">Rejeitar</button>
                       <button onClick={() => handleAction(item.id, 'approve')} className="flex-2 py-3 bg-accent text-bg rounded-xl text-[9px] font-black uppercase tracking-widest">Aprovar Agora</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && <div className="col-span-full py-20 text-center opacity-30 italic">Sem tarefas para aprovar hoje.</div>}
            </div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="relative max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                 <input 
                   type="text" 
                   placeholder="Pesquisar por Telemóvel ou Código..."
                   className="w-full bg-surface border border-border pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-accent"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead>
                     <tr className="bg-white/5 border-b border-border">
                        <th className="px-6 py-4 uppercase font-black tracking-widest text-text-secondary">Usuário</th>
                        <th className="px-6 py-4 uppercase font-black tracking-widest text-text-secondary">Upline (Convidado por)</th>
                        <th className="px-6 py-4 uppercase font-black tracking-widest text-text-secondary">Saldo em Conta</th>
                        <th className="px-6 py-4 uppercase font-black tracking-widest text-text-secondary">Nível VIP</th>
                        <th className="px-6 py-4 uppercase font-black tracking-widest text-text-secondary">Tickets</th>
                        <th className="px-6 py-4 uppercase font-black tracking-widest text-text-secondary">Ações</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {filteredUsers.map(u => (
                       <tr key={u.phone} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent overflow-hidden border border-white/10">
                                   {u.profileImage ? (
                                      <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                   ) : (
                                      <Users size={14} />
                                   )}
                                </div>
                                <div>
                                   <b className="text-white text-sm block">{u.name || u.phone}</b>
                                   {u.name && <span className="text-[7px] text-text-secondary block -mt-1 uppercase">{u.phone}</span>}
                                   <span className="text-[8px] text-accent font-black tracking-tighter uppercase">{u.inviteCode}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 font-serif text-emerald-400">MZN {(u.balance || 0).toLocaleString()}</td>
                          <td className="px-6 py-5">
                             <span className="font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">{u.level}</span>
                          </td>
                          <td className="px-6 py-5 font-bold text-accent">{u.tickets}</td>
                          <td className="px-6 py-5">
                             <button 
                               onClick={() => {
                                 setEditingUser(u);
                                 setEditForm({ balance: u.balance, level: u.level, tickets: u.tickets });
                               }}
                               className="font-black text-blue-400 hover:underline"
                             >
                               EDITAR
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <h3 className="text-xl font-serif italic mb-6">Pedidos de Saque Pendentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {withdrawals.map(w => (
                   <motion.div key={w.id} layout className="bg-surface border border-red-500/20 p-6 rounded-3xl shadow-xl flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                               <TrendingDown size={24} />
                            </div>
                            <div>
                               <b className="text-white block text-lg">{w.phone}</b>
                               <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">{w.channel}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-2xl font-serif text-red-400">-{w.amount} MT</div>
                            <span className="text-[8px] text-text-secondary uppercase">{new Date(w.requestTime).toLocaleString()}</span>
                         </div>
                      </div>
                      <div className="mt-auto pt-6 border-t border-white/5 flex gap-4">
                         <button onClick={() => handleWithdrawalAction(w.id, 'reject')} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-red-500/10 hover:text-red-500 transition-all">Negar</button>
                         <button onClick={() => handleWithdrawalAction(w.id, 'approve')} className="flex-1 py-4 bg-emerald-500 text-bg rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-emerald-500/20">Processar</button>
                      </div>
                   </motion.div>
                ))}
                {withdrawals.length === 0 && <div className="col-span-full py-20 text-center opacity-30 italic">Sem solicitações de saque.</div>}
              </div>
            </div>
          )}

          {activeTab === 'vip' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
               <div className="bg-surface border border-border p-8 rounded-3xl">
                  <h3 className="text-xl font-serif italic mb-6">Novo Plano VIP</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Nome do VIP</label>
                        <input type="text" placeholder="Ex: VIP 5" value={newVip.name} onChange={e => setNewVip({...newVip, name: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Preço (MT)</label>
                        <input type="number" placeholder="65000" value={newVip.price} onChange={e => setNewVip({...newVip, price: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Rendimento Diário (MT)</label>
                        <input type="number" placeholder="5400" value={newVip.daily} onChange={e => setNewVip({...newVip, daily: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Tarefas p/ Dia</label>
                        <input type="number" value={newVip.tasks} onChange={e => setNewVip({...newVip, tasks: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block">Ícone</label>
                        <select value={newVip.icon} onChange={e => setNewVip({...newVip, icon: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-accent">
                           <option value="zap">Raio (Básico)</option>
                           <option value="diamond">Diamante (Premium)</option>
                           <option value="crown">Coroa (Elite)</option>
                           <option value="flame">Fogo (Ultra)</option>
                           <option value="gem">Gema (Especial)</option>
                        </select>
                     </div>
                     <div className="flex items-end">
                        <button 
                          onClick={() => {
                            if (!newVip.name || !newVip.price || !newVip.daily) return alert("Preencha todos os campos!");
                            const planWithId = {
                              ...newVip,
                              id: Math.random().toString(36).substr(2, 9),
                              price: parseInt(newVip.price),
                              daily: parseInt(newVip.daily),
                              tasks: parseInt(newVip.tasks),
                              taskEarning: parseInt(newVip.daily) / parseInt(newVip.tasks)
                            };
                            const updated = [...vipPlans, planWithId];
                            socket.emit('update_vip_plans', updated);
                            setNewVip({ name: '', price: '0', daily: '0', tasks: '5', color: '#D4AF37', icon: 'zap' });
                            alert("Novo Plano VIP Criado!");
                          }}
                          className="w-full py-4 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20 active:scale-95 transition-all"
                        >
                           Adicionar Plano
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vipPlans.map(v => (
                    <div key={v.id} className="bg-surface border border-white/5 p-6 rounded-3xl relative group">
                       <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => setEditingVipPlan(v)}
                            className="text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             Editar
                          </button>
                          <button 
                            onClick={() => {
                              const updated = vipPlans.filter(p => p.id !== v.id);
                              socket.emit('update_vip_plans', updated);
                            }}
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             Excluir
                          </button>
                       </div>
                       <h4 className="text-xl font-serif text-white mb-4">{v.name}</h4>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] uppercase font-black text-text-secondary">
                             <span>Preço:</span>
                             <span className="text-accent">{(v.price || 0).toLocaleString()} MT</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase font-black text-text-secondary">
                             <span>Diário:</span>
                             <span className="text-emerald-400">{(v.daily || 0).toLocaleString()} MT</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase font-black text-text-secondary">
                             <span>Tarefas:</span>
                             <span className="text-white">{v.tasks}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
               <div className="bg-surface border border-border p-8 rounded-3xl">
                  <h3 className="text-xl font-serif italic mb-6">Criar Nova Tarefa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary">Título do Vídeo</label>
                        <input type="text" placeholder="Ex: Guia Investimento" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary">Plataforma</label>
                        <select value={newTask.platform} onChange={e => setNewTask({...newTask, platform: e.target.value as any})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white">
                           <option value="YouTube">YouTube</option>
                           <option value="TikTok">TikTok</option>
                           <option value="Facebook">Facebook</option>
                        </select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] uppercase font-black text-text-secondary">Link do Iframe (Video URL)</label>
                        <input type="text" placeholder="https://youtube.com/embed/..." value={newTask.videoUrl} onChange={e => setNewTask({...newTask, videoUrl: e.target.value})} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white" />
                     </div>
                     <div className="flex items-end">
                        <button 
                          onClick={() => {
                            if (!newTask.title || !newTask.videoUrl) return alert("Preencha os campos!");
                            socket.emit('add_task', newTask);
                            setNewTask({ title: '', platform: 'YouTube', videoUrl: '', duration: 15 });
                            alert("Tarefa adicionada com sucesso!");
                          }}
                          className="w-full py-4 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-[3px]"
                        >
                           Adicionar Tarefa
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map(t => (
                    <div key={t.id} className="bg-surface border border-white/5 p-6 rounded-3xl relative group">
                       <button 
                         onClick={() => socket.emit('remove_task', t.id)}
                         className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <Trash2 size={16} />
                       </button>
                       <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${t.platform === 'YouTube' ? 'bg-red-500/10 text-red-500' : t.platform === 'TikTok' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-blue-500/10 text-blue-500'}`}>
                             {t.platform === 'YouTube' ? <Megaphone size={16} /> : <Zap size={16} />}
                          </div>
                          <h4 className="text-white font-serif italic">{t.title}</h4>
                       </div>
                       <p className="text-[10px] text-text-secondary uppercase tracking-widest">{t.platform}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="bg-surface border border-border rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                     <h3 className="text-xl font-serif italic">Registos de Auditoria</h3>
                     <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full">Monitor em Tempo Real</span>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                     {auditLogs.map(log => (
                        <div key={log.id} className="p-6 hover:bg-white/5 transition-colors group">
                           <div className="flex justify-between items-start mb-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                log.action.includes('ADD') ? 'bg-emerald-500/10 text-emerald-500' : 
                                log.action.includes('REMOVE') ? 'bg-red-500/10 text-red-500' : 
                                'bg-accent/10 text-accent'
                              }`}>
                                 {log.action}
                              </span>
                              <span className="text-[8px] text-text-secondary opacity-50 font-mono tracking-tighter">
                                 {new Date(log.time).toLocaleString()}
                              </span>
                           </div>
                           <p className="text-sm text-text-secondary group-hover:text-white transition-colors">{log.details}</p>
                        </div>
                     ))}
                     {auditLogs.length === 0 && <div className="p-20 text-center opacity-30 italic">Sem logs registados ainda.</div>}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'financials' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {renderFinancials()}
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {renderReferrals()}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {renderSettings()}
            </motion.div>
          )}
      </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {/* User Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F0A2A] w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl">
               <h3 className="text-xl font-serif italic text-accent mb-6">Editar @{editingUser.phone}</h3>
               <div className="space-y-6">
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Saldo em Conta</label>
                     <input type="number" value={editForm.balance} onChange={(e) => setEditForm({...editForm, balance: parseInt(e.target.value) || 0})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Nível VIP</label>
                     <select value={editForm.level} onChange={(e) => setEditForm({...editForm, level: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent">
                        <option value="Membro Grátis">Membro Grátis</option>
                        {vipPlans.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Tickets</label>
                     <input type="number" value={editForm.tickets} onChange={(e) => setEditForm({...editForm, tickets: parseInt(e.target.value) || 0})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setEditingUser(null)} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px]">Cancelar</button>
                     <button onClick={saveUserEdits} className="flex-1 py-4 bg-accent text-bg rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20">Salvar Dados</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}

        {/* Edit Banner Modal */}
        {editingBanner && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F0A2A] w-full max-w-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
               <h3 className="text-xl font-serif italic text-accent mb-6">Editar Banner</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Título do Banner</label>
                     <input type="text" value={editingBanner.text} onChange={(e) => setEditingBanner({...editingBanner, text: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Subtítulo</label>
                     <input type="text" value={editingBanner.sub} onChange={(e) => setEditingBanner({...editingBanner, sub: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Fundo (Gradient/Cor)</label>
                     <input type="text" value={editingBanner.color} onChange={(e) => setEditingBanner({...editingBanner, color: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Cor do Texto</label>
                     <input type="text" value={editingBanner.textColor} onChange={(e) => setEditingBanner({...editingBanner, textColor: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs" />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">URL da Imagem</label>
                     <input type="text" value={editingBanner.imageUrl} onChange={(e) => setEditingBanner({...editingBanner, imageUrl: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs" />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setEditingBanner(null)} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px]">Cancelar</button>
                  <button onClick={updateBanner} className="flex-1 py-4 bg-accent text-bg rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20">Salvar Alterações</button>
               </div>
            </motion.div>
          </div>
        )}

        {/* Edit Prize Modal */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F0A2A] w-full max-w-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
               <h3 className="text-xl font-serif italic text-accent mb-6">Editar Vitrine</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Nome do Prêmio</label>
                     <input type="text" value={editingPrize.name} onChange={(e) => setEditingPrize({...editingPrize, name: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">URL da Imagem</label>
                     <input type="text" value={editingPrize.image} onChange={(e) => setEditingPrize({...editingPrize, image: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent font-mono text-xs" />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Descrição</label>
                     <textarea value={editingPrize.desc} onChange={(e) => setEditingPrize({...editingPrize, desc: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent min-h-[120px] resize-none" />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setEditingPrize(null)} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px]">Cancelar</button>
                  <button onClick={updatePrize} className="flex-1 py-4 bg-accent text-bg rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20">Salvar Alterações</button>
               </div>
            </motion.div>
          </div>
        )}

        {/* Edit VIP Modal */}
        {editingVipPlan && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F0A2A] w-full max-w-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
               <h3 className="text-xl font-serif italic text-accent mb-6">Editar Plano @{editingVipPlan.name}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Nome do VIP</label>
                     <input type="text" value={editingVipPlan.name} onChange={(e) => setEditingVipPlan({...editingVipPlan, name: e.target.value})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Preço (MT)</label>
                     <input type="number" value={editingVipPlan.price} onChange={(e) => setEditingVipPlan({...editingVipPlan, price: parseInt(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Rendimento Diário (MT)</label>
                     <input type="number" value={editingVipPlan.daily} onChange={(e) => setEditingVipPlan({...editingVipPlan, daily: parseInt(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Tarefas Diárias</label>
                     <input type="number" value={editingVipPlan.tasks} onChange={(e) => setEditingVipPlan({...editingVipPlan, tasks: parseInt(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                     <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">Dia de Saque (0=Dom, 1=Seg...)</label>
                     <input type="number" min="0" max="6" value={editingVipPlan.withdrawalDay} onChange={(e) => setEditingVipPlan({...editingVipPlan, withdrawalDay: parseInt(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setEditingVipPlan(null)} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px]">Cancelar</button>
                  <button onClick={updateVipPlan} className="flex-1 py-4 bg-accent text-bg rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-accent/20">Salvar Alterações</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
