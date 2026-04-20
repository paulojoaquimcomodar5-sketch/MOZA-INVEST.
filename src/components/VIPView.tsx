import { ShieldCheck, Zap, Gem, Crown, Check } from 'lucide-react';
import { VIP_PLANS } from '../constants';
import { User, VIPPlan } from '../types';

const VIP_METRIC_MAP: Record<string, { Icon: any, color: string }> = {
  'VIP 1': { Icon: ShieldCheck, color: 'text-blue-400' },
  'VIP 2': { Icon: Zap, color: 'text-accent' },
  'VIP 3': { Icon: Gem, color: 'text-purple-400' },
  'VIP 4': { Icon: Crown, color: 'text-pink-400' },
};

interface VIPViewProps {
  user: User | null;
  onActivate: (plan: VIPPlan) => void;
}

export default function VIPView({ user, onActivate }: VIPViewProps) {
  return (
    <div className="animate-fade px-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">Exclusividade VIP</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="space-y-6 mb-10">
        {VIP_PLANS.map((v) => {
          const metrics = VIP_METRIC_MAP[v.name] || { Icon: ShieldCheck, color: 'text-blue-400' };
          const monthly = v.dailyEarning * 30;
          const isCurrent = user?.level === v.name;
          
          return (
            <div key={v.name} className={`bg-surface border rounded-xl p-6 relative overflow-hidden group transition-all ${isCurrent ? 'border-accent shadow-[0_0_20px_rgba(227,179,65,0.1)]' : 'border-border hover:border-accent/40'}`}>
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-accent text-bg px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl z-20">
                  PLANO ATIVO
                </div>
              )}
              
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <metrics.Icon size={80} />
              </div>
              
              <div className="flex items-center gap-4 mb-6 relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-black/40 border border-white/5 shadow-inner ${metrics.color}`}>
                  <metrics.Icon size={28} />
                </div>
                <div>
                  <b className="text-xl font-serif text-white tracking-wide">{v.name}</b>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                     <p className="text-accent text-[10px] font-black uppercase tracking-[2px]">{v.price.toLocaleString()} MT</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 relative">
                <div className="bg-bg p-2 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[7px] block mb-0.5">Tarefa</small>
                  <b className="text-white text-[11px]">{v.taskEarning} MT</b>
                </div>
                <div className="bg-bg p-2 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[7px] block mb-0.5">Diário</small>
                  <b className="text-white text-[11px]">{v.dailyEarning} MT</b>
                </div>
                <div className="bg-bg p-2 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[7px] block mb-0.5">Mensal</small>
                  <b className="text-white text-[11px]">{monthly.toLocaleString()} MT</b>
                </div>
              </div>

              <ul className="space-y-2 mb-6 relative">
                {[
                  `${v.tasksPerDay} Tarefas diárias no YouTube`,
                  `Levantamento: ${v.withdrawalStart}h - ${v.withdrawalEnd}h`,
                  'Sem tarefas aos Domingos',
                  'Suporte Prioritário 24/7'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[10px] text-text-secondary uppercase tracking-tight">
                    <Check size={12} className="text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onActivate(v)}
                disabled={isCurrent}
                className={`w-full font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${isCurrent ? 'bg-white/5 text-white/20 cursor-default' : 'bg-accent text-bg hover:opacity-90 active:scale-95'}`}
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
