import React from 'react';
import { VIPPlan } from '../types';

interface VIPCardProps {
  plan: VIPPlan;
  onJoin: () => void;
}

const VIPCard: React.FC<VIPCardProps> = ({ plan, onJoin }) => {
  return (
    <div className="bg-surface p-5 rounded-xl border border-border flex justify-between items-center transition-all hover:bg-white/[0.02]">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <b className="text-accent font-serif tracking-wide">{plan.name}</b>
          <span className="text-[8px] bg-accent-muted text-accent px-1.5 py-0.5 rounded border border-accent/20 uppercase font-bold tracking-tighter">PREMIUM</span>
        </div>
        <div className="text-[11px] text-text-secondary leading-relaxed">
          Investimento: <span className="text-white font-medium">{plan.price.toLocaleString()} MT</span>
          <br />
          Rendimento: <span className="text-white font-medium">{plan.dailyEarning} MT/dia</span>
        </div>
      </div>
      <button 
        onClick={onJoin}
        className="bg-transparent border border-accent text-accent font-bold py-2 px-6 rounded text-[10px] uppercase tracking-widest hover:bg-accent hover:text-bg transition-all active:scale-95"
      >
        Participar
      </button>
    </div>
  );
};

export default VIPCard;
