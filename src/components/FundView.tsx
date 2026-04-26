import React, { useState } from 'react';
import { TrendingUp, PieChart, Landmark, ArrowUpRight, DollarSign, Wallet, Clock, Lock, CheckCircle2, ChevronRight, Calculator, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { useTranslation } from '../lib/i18n';
import socket from '../lib/socket';

interface FundViewProps {
  user: UserType | null;
  funds: any[];
}

export default function FundView({ user, funds }: FundViewProps) {
  const { t } = useTranslation();
  const [selectedFund, setSelectedFund] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = () => {
    const val = parseFloat(amount);
    if (!selectedFund || isNaN(val) || val < selectedFund.min) {
      alert(t('min_fund_alert', { min: selectedFund?.min }));
      return;
    }
    if (!user || val > user.balance) {
       alert(t('insufficient_balance_fund'));
       return;
    }

    setIsSubmitting(true);
    
    const handleResponse = (res: { success: boolean, message?: string }) => {
      setIsSubmitting(false);
      socket.off('fund_subscription_response', handleResponse);
      
      if (res.success) {
        alert(t('fund_subscription_pending'));
        setSelectedFund(null);
        setAmount('');
      } else {
        alert(res.message || t('fund_subscription_error'));
      }
    };

    socket.on('fund_subscription_response', handleResponse);

    socket.emit('subscribe_fund', {
      phone: user.phone,
      fundId: selectedFund.id,
      amount: val
    });

    setTimeout(() => {
      if (isSubmitting) {
        socket.off('fund_subscription_response', handleResponse);
        setIsSubmitting(false);
        alert(t('timeout_error'));
      }
    }, 10000);
  };

  return (
    <div className="animate-fade px-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">{t('fund_view_title')}</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="bg-linear-to-br from-surface to-bg border border-border rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Landmark size={80} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <small className="text-text-secondary uppercase text-[8px] tracking-[2px] font-black block mb-1">{t('fund_balance')}</small>
            <div className="text-2xl font-serif text-accent">MZN {(user?.fundBalance || 0).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <small className="text-text-secondary uppercase text-[8px] tracking-[2px] font-black block mb-1">{t('total_profit')}</small>
            <div className="text-2xl font-serif text-emerald-400">+{user?.totalProfit || '0.00'}</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-text-secondary uppercase tracking-[2px]">{t('active_management')}</span>
          </div>
          <button className="text-accent text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 hover:underline">
            {t('history')} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between px-2 mb-2">
           <p className="text-[10px] uppercase tracking-[3px] text-text-secondary font-black">{t('available_funds')}</p>
           <Calculator size={14} className="text-accent" />
        </div>

        {funds.map((fund) => (
          <button 
            key={fund.id} 
            onClick={() => setSelectedFund(fund)}
            className="w-full bg-surface border border-border p-6 rounded-2xl text-left group hover:border-accent/40 transition-all active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-accent border border-border group-hover:bg-accent group-hover:text-bg transition-colors">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <b className="text-white text-lg font-serif block group-hover:text-accent transition-colors">{fund.name}</b>
                  <span className={`text-[8px] uppercase font-black tracking-widest ${
                    fund.risk === 'Baixo' ? 'text-emerald-400' : 
                    fund.risk === 'Médio' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {t('risk')} {fund.risk}  •  MIN {fund.min} MT
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold text-lg flex items-center justify-end gap-1">
                  +{fund.rate}% <span className="text-[8px] uppercase font-black tracking-widest ml-1">{t('per_day')}</span>
                </div>
                <small className="text-text-secondary text-[9px] uppercase tracking-widest font-bold">{fund.period}</small>
              </div>
            </div>
            
            <p className="text-text-secondary text-[10px] leading-relaxed mb-4 line-clamp-2">
              {fund.desc}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
               <div className="flex items-center gap-2 text-white/40">
                  <Clock size={12} />
                  <span className="text-[9px] uppercase tracking-widest">{t('instant_allocation')}</span>
               </div>
               <ArrowUpRight size={18} className="text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedFund && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-bg/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-border p-8 rounded-3xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-white font-serif text-xl italic leading-none">{t('subscription_title')}</h4>
                 <button onClick={() => setSelectedFund(null)} className="text-text-secondary hover:text-white">
                    <X size={18} />
                 </button>
              </div>

              <div className="bg-bg rounded-2xl p-5 border border-border mb-6">
                <b className="text-white block mb-1">{selectedFund.name}</b>
                <div className="flex justify-between items-center">
                  <span className="text-accent text-[10px] font-black uppercase tracking-widest">{t('estimated_yield')}</span>
                  <span className="text-emerald-400 font-bold">+{selectedFund.rate}% {t('yield_per_day')}</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-3 ml-1">{t('amount_to_allocate')}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={16} />
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t('min_placeholder', { min: selectedFund.min })}
                      className="w-full bg-bg border border-border p-4 pl-12 rounded-xl text-white outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <Wallet size={20} className="text-accent shrink-0" />
                  <div className="text-[9px] uppercase tracking-widest leading-relaxed text-text-secondary">
                    {t('available_balance')}: <span className="text-white font-bold">{(user?.balance || 0).toLocaleString()} MT</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg shadow-accent/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-bg border-t-transparent" />
                ) : (
                  <>{t('activate_investment_btn')} <CheckCircle2 size={16} /></>
                )}
              </button>
              
              <p className="text-center mt-6 text-[8px] text-text-secondary uppercase tracking-[2px] leading-relaxed">
                {t('fund_terms')}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
