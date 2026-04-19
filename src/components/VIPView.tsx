import { ShieldCheck, Zap, Gem, Crown, Check } from 'lucide-react';
import { VIP_PLANS } from '../constants';

const VIP_METRIC_MAP: Record<string, { Icon: any, color: string }> = {
  'VIP 1': { Icon: ShieldCheck, color: 'text-blue-400' },
  'VIP 2': { Icon: Zap, color: 'text-accent' },
  'VIP 3': { Icon: Gem, color: 'text-purple-400' },
  'VIP 4': { Icon: Crown, color: 'text-pink-400' },
};

export default function VIPView() {
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
          
          return (
            <div key={v.name} className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden group hover:border-accent/40 transition-all">
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

              <div className="grid grid-cols-2 gap-4 mb-6 relative">
                <div className="bg-bg p-3 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[9px] block mb-1">Diário</small>
                  <b className="text-white">{v.dailyEarning} MT</b>
                </div>
                <div className="bg-bg p-3 rounded-lg border border-border">
                  <small className="text-text-secondary uppercase text-[9px] block mb-1">Mensal</small>
                  <b className="text-white">{monthly.toLocaleString()} MT</b>
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

              <button className="w-full bg-accent text-bg font-bold py-3 rounded-lg text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">
                ACTIVAR AGORA
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
