import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  planName: string;
}

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ isVisible, onClose, planName }) => {
  useEffect(() => {
    if (isVisible) {
      // Trigger gold confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#E3B341', '#FFFFFF', '#FFD700'] });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#E3B341', '#FFFFFF', '#FFD700'] });
      }, 250);

      const timeout = setTimeout(onClose, 5000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="bg-surface w-full max-w-sm rounded-[32px] border border-accent/20 p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(227,179,65,0.2)]"
          >
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-inner"
              >
                <Crown className="text-accent" size={40} />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-serif italic text-white mb-2"
              >
                Parabéns!
              </motion.h2>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 text-accent mb-6"
              >
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[3px]">{planName} Ativado</span>
                <Sparkles size={16} />
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-text-secondary text-xs leading-relaxed mb-8"
              >
                Bem-vindo ao próximo nível de rendimentos. A sua jornada MOZA INV acaba de ficar mais luxuosa.
              </motion.p>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="w-full bg-accent text-bg py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] shadow-lg shadow-accent/20 active:scale-95 transition-all"
              >
                Começar a Lucrar
              </motion.button>
            </div>

            {/* Decorative checks */}
            <div className="absolute -bottom-6 -right-6 text-accent/5 -rotate-12 translate-y-2">
              <CheckCircle2 size={120} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessCelebration;
