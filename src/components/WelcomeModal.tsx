import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Wallet, ChevronRight, X, Sparkles } from 'lucide-react';
import { User } from '../types';
import { useTranslation } from '../lib/i18n';

interface WelcomeModalProps {
  user: User | null;
  onClose: () => void;
  isVisible: boolean;
  settings?: {
    title: string;
    message: string;
  };
}

export default function WelcomeModal({ user, onClose, isVisible, settings }: WelcomeModalProps) {
  const { t } = useTranslation();

  if (!user) return null;

  const displayTitle = settings?.title?.replace('{name}', user.name) || `Olá, ${user.name}!`;
  const displayMessage = settings?.message || "A sua jornada para a elite financeira continua. Comece as suas tarefas diárias para maximizar os rendimentos.";

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-surface border border-accent/20 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header / Banner */}
            <div className="relative h-32 bg-linear-to-r from-accent to-accent-muted overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-4 right-4 focus:outline-none">
                    <button 
                        onClick={onClose}
                        className="bg-bg/20 text-bg hover:bg-bg/40 p-2 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 p-6 flex items-center gap-3">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="text-accent" size={24} />
                   </div>
                   <div>
                      <h4 className="text-bg font-serif italic text-xl leading-tight">{displayTitle}</h4>
                      <p className="text-bg/60 text-[9px] uppercase font-bold tracking-[2px]">Painel Moza Gold</p>
                   </div>
                </div>
            </div>

            <div className="p-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-bg/40 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">{t('vip_class')}</p>
                            <p className="text-white font-serif italic text-lg">{user.level}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-bg/40 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">{t('available_balance')}</p>
                            <p className="text-accent font-serif text-xl">MZN {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <p className="text-[10px] text-text-secondary uppercase font-medium tracking-wider text-center leading-relaxed">
                            {displayMessage}
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-accent text-bg font-black py-4 rounded-2xl text-[10px] uppercase tracking-[4px] shadow-xl shadow-accent/20 flex items-center justify-center gap-2 group hover:gap-4 transition-all"
                    >
                        <span>Aceder ao Painel</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
