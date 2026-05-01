import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, History, Wallet, Shield, Settings, Info, CheckCircle2, Terminal, Key, Smartphone, Lock, TrendingUp, Filter, Calendar, Download, ChevronDown, Languages, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useTranslation, Language } from '../lib/i18n';

import socket from '../lib/socket';

interface SubViewProps {
  onBack: () => void;
  user?: any;
}

const HISTORICAL_DATA = [
  { day: '13/04', vip: 300, tasks: 50, team: 20 },
  { day: '14/04', vip: 350, tasks: 40, team: 30 },
  { day: '15/04', vip: 320, tasks: 60, team: 45 },
  { day: '16/04', vip: 400, tasks: 80, team: 55 },
  { day: '17/04', vip: 450, tasks: 70, team: 80 },
  { day: '18/04', vip: 520, tasks: 110, team: 100 },
  { day: 'Hoje', vip: 36, tasks: 10, team: 5 },
];

const CATEGORY_DATA = [
  { name: 'VIP 1', value: 2500, color: '#D4AF37' },
  { name: 'VIP 2', value: 4200, color: '#4A90E2' },
  { name: 'Tarefas', value: 1200, color: '#10B981' },
  { name: 'Equipa', value: 850, color: '#8B5CF6' },
];

export function ProfitReportsView({ onBack }: SubViewProps) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  const rawReports = [
    { id: 1, date: '2026-04-22', amount: 36.00, desc: 'Rendimento VIP 1', type: 'VIP' },
    { id: 2, date: '2026-04-22', amount: 10.00, desc: 'Tarefa: Social Share', type: 'Tarefa' },
    { id: 3, date: '2026-04-18', amount: 100.00, desc: 'Comissão Equipa N1', type: 'Equipa' },
    { id: 4, date: '2026-04-18', amount: 36.00, desc: 'Rendimento VIP 1', type: 'VIP' },
    { id: 5, date: '2026-04-15', amount: 50.00, desc: 'Comissão Equipa N2', type: 'Equipa' },
    { id: 6, date: '2026-04-10', amount: 10.00, desc: 'Tarefa: App Reivew', type: 'Tarefa' },
  ];

  const filteredReports = useMemo(() => {
    return rawReports.filter(r => {
      const matchType = activeFilter === 'Todos' || r.type === activeFilter;
      const matchDate = (!dateRange.start || r.date >= dateRange.start) && 
                        (!dateRange.end || r.date <= dateRange.end);
      return matchType && matchDate;
    });
  }, [activeFilter, dateRange]);

  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Valor (MT)', 'Descricao', 'Tipo'];
    const rows = filteredReports.map(r => [r.id, r.date, r.amount, r.desc, r.type]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_lucros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade px-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-text-secondary hover:text-accent"><ArrowLeft size={24} /></button>
          <h3 className="text-white font-serif italic text-2xl">Relatórios</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-accent border-accent text-bg' : 'border-border text-text-secondary'}`}
          >
            <Filter size={16} />
          </button>
          <button 
            onClick={exportToCSV}
            className="p-2 rounded-lg border border-border text-accent hover:bg-accent/10 transition-all"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-surface border border-border rounded-2xl p-6 mb-8 space-y-6 overflow-hidden"
        >
          <div>
            <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-4">Filtrar por Período</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full bg-bg border border-border p-3 pl-10 rounded-xl text-white text-[10px] outline-none focus:border-accent" 
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full bg-bg border border-border p-3 pl-10 rounded-xl text-white text-[10px] outline-none focus:border-accent" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-4">Tipo de Rendimento</label>
            <div className="flex flex-wrap gap-2">
              {['Todos', 'VIP', 'Tarefa', 'Equipa'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-[9px] uppercase font-black tracking-widest px-4 py-2 rounded-lg border transition-all ${activeFilter === f ? 'bg-accent border-accent text-bg' : 'border-border text-text-secondary hover:border-white/20'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { setDateRange({start: '', end: ''}); setActiveFilter('Todos'); }}
            className="w-full py-3 text-[9px] uppercase font-black tracking-[3px] text-accent border border-accent/20 rounded-xl hover:bg-accent/5"
          >
            Limpar Filtros
          </button>
        </motion.div>
      )}

      {/* Chart Section */}
      <div className="bg-surface border border-border p-6 rounded-2xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-accent text-[8px] uppercase font-black tracking-[2px]">Histórico de Ganhos</span>
            <h4 className="text-white font-serif text-lg">Evolução Diária</h4>
          </div>
          <TrendingUp className="text-accent/30" size={20} />
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_DATA}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#8E9299', fontSize: 10}} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1B1E', border: '1px solid #2C2D31', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Area 
                type="monotone" 
                dataKey="vip" 
                stroke="#D4AF37" 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Section */}
      <div className="bg-surface border border-border p-6 rounded-2xl mb-8">
        <h4 className="text-white text-xs uppercase tracking-widest font-black mb-6 text-center">Distribuição por Categoria</h4>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CATEGORY_DATA} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1A1B1E', border: '1px solid #2C2D31', fontSize: '10px' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          {CATEGORY_DATA.map((cat, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-text-secondary text-[9px] uppercase font-bold tracking-widest">{cat.name}</span>
              </div>
              <b className="text-white text-sm font-serif">{(cat.value || 0).toLocaleString()} MT</b>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <History size={14} className="text-accent" />
            <p className="text-[10px] uppercase tracking-[3px] text-text-secondary font-black">Registos Encontrados ({filteredReports.length})</p>
          </div>
        </div>
        {filteredReports.map((r) => (
          <div key={r.id} className="bg-surface border border-border p-5 rounded-2xl flex justify-between items-center group hover:border-accent/30 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black ${
                r.type === 'VIP' ? 'bg-accent/10 text-accent' : 
                r.type === 'Tarefa' ? 'bg-emerald-500/10 text-emerald-400' : 
                'bg-blue-500/10 text-blue-400'
              }`}>
                {r.type[0]}
              </div>
              <div>
                <b className="text-white text-[13px] block font-serif tracking-tight">{r.desc}</b>
                <small className="text-text-secondary uppercase text-[8px] tracking-widest font-black leading-none">{r.date}</small>
              </div>
            </div>
            <div className="text-emerald-400 font-serif font-bold text-base">+{r.amount.toFixed(2)} MT</div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="py-12 bg-surface/50 border border-dashed border-border rounded-2xl text-center">
            <Filter size={32} className="mx-auto text-text-secondary/20 mb-4" />
            <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">Nenhum resultado nos filtros atuais</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function WithdrawalHistoryView({ onBack }: SubViewProps) {
  const history = [
    { date: '15 Abr', amount: '500.00 MT', status: 'Concluído', method: 'M-Pesa' },
  ];

  return (
    <div className="animate-fade px-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-text-secondary hover:text-accent"><ArrowLeft size={24} /></button>
        <h3 className="text-white font-serif italic text-2xl">Histórico de Saques</h3>
      </div>
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((h, i) => (
            <div key={i} className="bg-surface border border-border p-5 rounded-xl flex justify-between items-center">
              <div>
                <b className="text-white text-sm block">{h.method}</b>
                <small className="text-text-secondary uppercase text-[8px] tracking-widest font-black">{h.date}</small>
              </div>
              <div className="text-right">
                <div className="text-white font-serif font-bold">{h.amount}</div>
                <div className="text-[8px] uppercase font-black tracking-tighter text-emerald-400">{h.status}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-30">
          <Wallet size={64} className="mx-auto mb-4" />
          <p className="text-xs uppercase tracking-[3px] font-bold">Sem registos</p>
        </div>
      )}
    </div>
  );
}

export function SecurityView({ onBack, user }: SubViewProps) {
  const [activeStep, setActiveStep] = useState<'list' | 'password' | 'pin' | '2fa'>('list');
  const [isMozaGuardActive, setIsMozaGuardActive] = useState(() => {
    return localStorage.getItem(`moza_guard_${user?.phone}`) === 'true';
  });
  const { t } = useTranslation();

  const handleActivateGuard = () => {
    setIsMozaGuardActive(true);
    localStorage.setItem(`moza_guard_${user?.phone}`, 'true');
    
    // Emit task completion for security activation
    socket.emit('task_completed', {
      user: user?.phone,
      taskId: 'security_activation',
      reward: 20, // Give MZN 20 as reward for securing account
      platform: 'YouTube' // Use a default platform or add 'Security' if supported
    });
    
    alert("MOZA GUARD ATIVADO: Sua conta está agora sob proteção de nível Enclave. +MZN 20 creditados.");
  };

  const renderContent = () => {
    switch (activeStep) {
      case 'password':
        return (
          <div className="space-y-6">
            <button onClick={() => setActiveStep('list')} className="text-accent flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mb-2">
              <ArrowLeft size={16} /> Voltar à Lista
            </button>
            <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
              <div>
                <label className="text-[10px] uppercase text-text-secondary font-black tracking-widest block mb-2">Senha Atual</label>
                <input type="password" placeholder="••••••••" className="w-full bg-bg border border-border p-3 rounded-lg text-white outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-text-secondary font-black tracking-widest block mb-2">Nova Senha</label>
                <input type="password" placeholder="••••••••" className="w-full bg-bg border border-border p-3 rounded-lg text-white outline-none focus:border-accent transition-colors" />
              </div>
              <button className="w-full bg-accent text-bg font-bold py-3 rounded-lg text-xs uppercase tracking-widest">Atualizar Senha</button>
            </div>
          </div>
        );
      case 'pin':
        return (
          <div className="space-y-6">
            <button onClick={() => setActiveStep('list')} className="text-accent flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mb-2">
              <ArrowLeft size={16} /> Voltar à Lista
            </button>
            <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-4">
              <Terminal size={32} className="text-accent mx-auto mb-2" />
              <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-relaxed px-4">Esta senha será solicitada para confirmar todos os seus levantamentos.</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <input key={i} type="password" maxLength={1} className="w-10 h-12 bg-bg border border-border text-center rounded-lg text-white focus:border-accent outline-none" placeholder="•" />
                ))}
              </div>
              <button className="w-full bg-accent text-bg font-bold py-3 rounded-lg text-xs uppercase tracking-widest mt-4">Definir PIN de Transação</button>
            </div>
          </div>
        );
      case '2fa':
        return (
          <div className="space-y-6">
            <button onClick={() => setActiveStep('list')} className="text-accent flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mb-2">
              <ArrowLeft size={16} /> Voltar à Lista
            </button>
            <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                  <Smartphone size={24} />
                </div>
                <div>
                  <b className="text-white block">Google Authenticator</b>
                  <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">Ativo</span>
                </div>
              </div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider leading-relaxed">Proteja a sua conta com uma camada extra de segurança utilizando códigos temporários.</p>
              <button className="w-full border border-red-500/30 text-red-500 font-bold py-3 rounded-lg text-xs uppercase tracking-widest bg-red-500/5 hover:bg-red-500/10 transition-colors">Desativar 2FA</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Elite Status Badge */}
            <div className={`border transition-all duration-500 p-6 rounded-2xl relative overflow-hidden group ${isMozaGuardActive ? 'bg-linear-to-r from-emerald-500/10 to-transparent border-emerald-500/20' : 'bg-linear-to-r from-accent/10 to-transparent border-accent/20'}`}>
               <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                  <Shield size={64} className={isMozaGuardActive ? 'text-emerald-500' : 'text-accent'} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                     <div className={`w-2 h-2 rounded-full ${isMozaGuardActive ? 'bg-emerald-500 animate-pulse' : 'bg-accent/40'}`} />
                     <span className={`text-[9px] uppercase font-black tracking-[3px] ${isMozaGuardActive ? 'text-emerald-400' : 'text-accent/60'}`}>
                       {isMozaGuardActive ? 'Sistema Moza Guard Ativo' : 'Proteção Elite Disponível'}
                     </span>
                  </div>
                  <h4 className="text-white font-serif text-xl italic mb-1">Moza Enclave</h4>
                  
                  {isMozaGuardActive ? (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-text-secondary text-[9px] uppercase tracking-widest leading-loose"
                    >
                       Encriptação Neural 512-bit Ativada<br/>
                       Monitoramento em Tempo Real contra Intrusos<br/>
                       IP Privado Certificado para Moçambique
                    </motion.p>
                  ) : (
                    <div className="mt-4">
                      <p className="text-text-secondary text-[8px] uppercase tracking-widest mb-4">Ative a proteção máxima para seus levantamentos e dados pessoais.</p>
                      <button 
                        onClick={handleActivateGuard}
                        className="bg-accent text-bg px-6 py-2 rounded-lg text-[9px] uppercase font-black tracking-[2px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      >
                        Ativar Agora
                      </button>
                    </div>
                  )}
               </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'password', label: 'Alterar Senha de Login', Icon: Shield },
                { id: 'pin', label: 'Senha de Transação', Icon: Lock },
                { id: '2fa', label: 'Autenticação 2FA', Icon: Smartphone },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveStep(item.id as any)}
                  className="w-full bg-surface border border-border p-5 rounded-xl flex items-center gap-4 group hover:border-accent/40 transition-all font-sans"
                >
                  <div className="text-accent/60 group-hover:text-accent transition-colors"><item.Icon size={18} /></div>
                  <span className="text-text-secondary text-[10px] uppercase tracking-widest font-black group-hover:text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade px-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-text-secondary hover:text-accent"><ArrowLeft size={24} /></button>
        <h3 className="text-white font-serif italic text-2xl">Segurança</h3>
      </div>
      {renderContent()}
    </div>
  );
}

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'pt', label: 'Português', flag: '🇵🇹' },
];

export function SettingsView({ onBack }: SubViewProps) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade px-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-text-secondary hover:text-accent"><ArrowLeft size={24} /></button>
        <h3 className="text-white font-serif italic text-2xl">{t('settings')}</h3>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <Settings size={40} className="mx-auto text-accent mb-4 animate-spin-slow" />
          <h4 className="text-white font-serif text-lg mb-2">Preferências do Sistema</h4>
          <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-relaxed">
            Versão da Plataforma: <span className="text-white">v3.2.0-Gold</span><br/>
            Limpeza de Cache e Otimização de Rede.
          </p>
          <div className="mt-8 space-y-4">
             <div className="p-4 bg-bg/50 border border-border rounded-xl">
               <span className="text-[9px] text-text-secondary uppercase tracking-widest block mb-1">Idioma Selecionado</span>
               <span className="text-white text-xs font-bold uppercase tracking-widest">Português (Padrão)</span>
             </div>
             <button className="text-accent text-[10px] font-black uppercase tracking-[3px] border-b border-accent/30 pb-1">Limpar Dados</button>
          </div>
        </div>
      </div>
    </div>
  );
}
