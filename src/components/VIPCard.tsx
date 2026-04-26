import React from 'react';
import { motion } from 'motion/react';
import { VIPPlan } from '../types';

interface VIPCardProps {
  plan: VIPPlan;
  onJoin: () => void;
  userLevel?: string;
}

const VIPCard: React.FC<VIPCardProps> = ({ plan, onJoin, userLevel }) => {
  const isCurrent = userLevel === plan.name;
  
  return (
    <div className={`p-5 rounded-xl border flex justify-between items-center transition-all ${isCurrent ? 'bg-accent/5 border-accent shadow-[0_0_15px_rgba(227,179,65,0.1)]' : 'bg-surface border-border hover:bg-white/[0.02]'}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <b className="text-accent font-serif tracking-wide">{plan.name}</b>
          {isCurrent ? (
            <span className="text-[8px] bg-accent text-bg px-1.5 py-0.5 rounded border border-accent/20 uppercase font-black tracking-tighter">ATIVO</span>
          ) : (
            <span className="text-[8px] bg-accent-muted text-accent px-1.5 py-0.5 rounded border border-accent/20 uppercase font-bold tracking-tighter">PREMIUM</span>
          )}
        </div>
        <div className="text-[11px] text-text-secondary leading-relaxed">
          Investimento: <span className="text-white font-medium">{(plan.price || 0).toLocaleString()} MT</span>
          <br />
          Rendimento: <span className="text-white font-medium">{(plan as any).daily || (plan as any).dailyEarning || 0} MT/dia</span>
        </div>
      </div>
      
      {!isCurrent ? (
        <motion.button 
          onClick={onJoin}
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 0px rgba(227, 179, 65, 0)",
              "0 0 15px rgba(227, 179, 65, 0.4)",
              "0 0 0px rgba(227, 179, 65, 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="font-bold py-2 px-6 rounded text-[10px] uppercase tracking-widest bg-transparent border border-accent text-accent hover:bg-accent hover:text-bg active:scale-95 transition-all"
        >
          ACTIVAR AGORA
        </motion.button>
      ) : (
        <button 
          disabled
          className="font-bold py-2 px-6 rounded text-[10px] uppercase tracking-widest bg-white/5 text-white/20 border-white/10"
        >
          ADQUIRIDO
        </button>
      )}
    </div>
  );
};

export default VIPCard;
