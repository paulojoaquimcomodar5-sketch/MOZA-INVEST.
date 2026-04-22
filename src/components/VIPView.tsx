import { ShieldCheck, Zap, Gem, Crown, Check, Flame, Diamond } from 'lucide-react';
import { User, VIPPlan } from '../types';

const VIP_METRIC_MAP: Record<string, { Icon: any, color: string }> = {
  'zap': { Icon: Zap, color: 'text-blue-400' },
  'diamond': { Icon: Diamond, color: 'text-accent' },
  'crown': { Icon: Crown, color: 'text-purple-400' },
  'flame': { Icon: Flame, color: 'text-pink-400' },
  'gem': { Icon: Gem, color: 'text-emerald-400' },
};

interface VIPViewProps {
  user: User | null;
  onActivate: (plan: VIPPlan) => void;
  vipPlans?: any[];
}

export default function VIPView({ user, onActivate, vipPlans }: VIPViewProps) {
  const plans = vipPlans || [];
  
  return (
    <div className="animate-fade px-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">Exclusividade VIP</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="space-y-6 mb-10">
        {plans.map((v) => {
          const metric = VIP_METRIC_MAP[v.icon] || { Icon: ShieldCheck, color: 'text-blue-400' };
          const monthly = v.daily * 30;
          const isCurrent = user?.level === v.name;
          
          return (
            <div key={v.id} className={`bg-surface border rounded-xl p-6 relative overflow-hidden group transition-all ${isCurrent ? 'border-accent shadow-[0_0_20px_rgba(227,179,65,0.1)]' : 'border-border hover:border-accent/40'}`}>
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-accent text-bg px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl z-20">
                  PLANO ATIVO
                </div>
              )}
              
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <metric.Icon size={80} />
              </div>
              
              <div className="flex items-center gap-4 mb-6 relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-black/40 border border-white/5 shadow-inner ${metric.color}`}>
                  <metric.Icon size={28} />
                </div>
                <div>
                  <b className="text-xl font-serif text-white tracking-wide">{v.name}</b>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                     <p className="text-accent text-[10px] font-black uppercase tracking-[2px]">{v.price.toLocaleString()} MT</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 relative">
                <div className="bg-bg p-4 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[8px] font-black tracking-widest block mb-1">Rendimento Diário</small>
                  <b className="text-white text-lg font-serif">{v.daily.toLocaleString()} MT</b>
                </div>
                <div className="bg-bg p-4 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[8px] font-black tracking-widest block mb-1">Total Mensal</small>
                  <b className="text-white text-lg font-serif">{monthly.toLocaleString()} MT</b>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center justify-between text-[10px] text-text-secondary font-bold uppercase tracking-widest border-b border-border pb-3">
                    <span>Limite de Tarefas</span>
                    <span className="text-white">{v.tasks} / Dia</span>
                 </div>
                 <ul className="space-y-3">
                    {[
                      'Atribuição Prioritária de Tarefas',
                      'Suporte WhatsApp Exclusivo',
                      'Levantamentos Rápidos',
                      'Taxas Reduzidas'
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-[10px] text-text-secondary uppercase tracking-tight">
                        <Check size={12} className="text-accent" />
                        {feature}
                      </li>
                    ))}
                 </ul>
              </div>

              <button 
                onClick={() => onActivate(v)}
                disabled={isCurrent}
                className={`w-full font-bold py-4 rounded-lg text-xs uppercase tracking-[2px] shadow-lg transition-all ${isCurrent ? 'bg-white/5 text-white/20 cursor-default border border-white/5' : 'bg-accent text-bg hover:opacity-90 active:scale-95 shadow-accent/10'}`}
              >
                {isCurrent ? 'PLANO ACTUAL' : 'ACTIVAR AGORA'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
