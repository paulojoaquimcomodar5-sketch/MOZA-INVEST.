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
  LayoutDashboard
} from 'lucide-react';
import socket from '../lib/socket';
import { User } from '../types';

interface ApprovalItem {
  id: string;
  type: 'BANNER' | 'PAYMENT' | 'LOTTERY';
  user: string;
  data: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  time: string;
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

type AdminTab = 'overview' | 'approvals' | 'users' | 'withdrawals' | 'banners';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingApprovals: 0,
    pendingWithdrawals: 0,
    activeBanners: 0,
    currentInviteCode: 'MOZA2026'
  });

  const [newBanner, setNewBanner] = useState({ text: '', sub: '', color: 'linear-gradient(135deg, #1e293b, #0f172a)', textColor: '#e3b341', imageUrl: '' });
  const [tempInviteCode, setTempInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initial fetch
    socket.emit('get_pending_approvals');
    socket.emit('get_all_users');
    socket.emit('get_system_stats');
    socket.emit('get_pending_withdrawals');
    socket.emit('get_banners');

    socket.on('approvals_list', (list: ApprovalItem[]) => setItems(list));
    socket.on('users_list', (list: User[]) => setUsers(list));
    socket.on('system_stats', (data: any) => setStats(data));
    socket.on('banners_list', (list: BannerItem[]) => setBanners(list));
    socket.on('withdrawals_list', (list: WithdrawalItem[]) => {
      setWithdrawals(list);
      setLoading(false);
    });

    socket.on('new_approval_needed', (item: ApprovalItem) => {
      setItems(prev => [item, ...prev]);
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

    return () => {
      socket.off('approvals_list');
      socket.off('users_list');
      socket.off('system_stats');
      socket.off('withdrawals_list');
      socket.off('new_approval_needed');
      socket.off('item_status_updated');
      socket.off('withdrawal_status_updated');
    };
  }, []);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    socket.emit(action === 'approve' ? 'approve_item' : 'reject_item', id);
  };

  const handleWithdrawalAction = (id: string, action: 'approve' | 'reject') => {
    socket.emit(action === 'approve' ? 'approve_withdrawal' : 'reject_withdrawal', id);
  };

  const filteredUsers = users.filter(u => 
    (u.phone && u.phone.includes(searchTerm)) || 
    (u.inviteCode && u.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {[
        { label: 'Utilizadores', value: stats.totalUsers, color: 'text-blue-400', Icon: Users },
        { label: 'Capital Total', value: `${stats.totalBalance.toLocaleString()} MT`, color: 'text-emerald-400', Icon: BarChart3 },
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

  return (
    <div className="min-h-screen bg-[#0A051E] p-6 text-white font-sans pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-accent transition-all active:scale-95">
              <ArrowLeft size={24} />
            </button>
            <div>
               <h1 className="text-2xl font-serif italic text-white">Central de Comando</h1>
               <p className="text-[10px] uppercase font-black tracking-[4px] text-accent">Moza Inv • Admnistrador</p>
            </div>
          </div>
          
          <div className="flex bg-surface p-1 rounded-xl border border-border">
            {(['overview', 'approvals', 'users', 'withdrawals', 'banners'] as AdminTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-accent text-bg shadow-lg' : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Geral'}
                {tab === 'approvals' && 'Tarefas'}
                {tab === 'users' && 'Usuários'}
                {tab === 'withdrawals' && 'Saques'}
                {tab === 'banners' && 'Banners'}
              </button>
            ))}
          </div>
        </div>

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
                                {item.type === 'PAYMENT' ? <CreditCard size={18} /> : <ImageIcon size={18} />}
                             </div>
                             <div>
                                <b className="text-[12px] block text-white">{item.type === 'PAYMENT' ? 'Solicitação de Depósito' : 'Nova Tarefa'}</b>
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
                          <span className="text-[11px] font-serif text-accent">MZN {u.balance.toLocaleString()}</span>
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
                    <button 
                      onClick={() => socket.emit('remove_banner', banner.id)}
                      className="absolute top-8 right-8 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle size={16} />
                    </button>
                 </div>
               ))}
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
                  {/* Approval Card Content (Keeping similar to before but polished) */}
                  <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                       <div className="p-2 bg-accent/10 rounded-lg text-accent">
                         {item.type === 'BANNER' && <ImageIcon size={18} />}
                         {item.type === 'PAYMENT' && <Coins size={18} />}
                         {item.type === 'LOTTERY' && <FerrisWheel size={18} />}
                       </div>
                       <div>
                         <h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{item.type}</h4>
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

            <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                   <tr className="bg-white/5 border-b border-border">
                      <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary">Usuário</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary">Saldo em Conta</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary">Nível VIP</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary">Tickets</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary">Ações</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredUsers.map(u => (
                     <tr key={u.phone} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                                 <Users size={14} />
                              </div>
                              <div>
                                 <b className="text-white text-sm block">{u.phone}</b>
                                 <span className="text-[8px] text-accent font-black tracking-tighter uppercase">{u.inviteCode}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 font-serif text-emerald-400">MZN {u.balance.toLocaleString()}</td>
                        <td className="px-6 py-5">
                           <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">{u.level}</span>
                        </td>
                        <td className="px-6 py-5 font-bold text-accent">{u.tickets}</td>
                        <td className="px-6 py-5">
                           <button className="text-[10px] font-black text-blue-400 hover:underline">DETALHES</button>
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
      </div>

      {/* Admin Floating Info */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-border px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black tracking-widest uppercase text-white/60">Sistema Online</span>
         </div>
         <div className="w-px h-4 bg-border"></div>
         <span className="text-[10px] font-black tracking-widest uppercase text-accent">Tempo Real Habilitado</span>
      </div>
    </div>
  );
}
