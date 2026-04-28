import React, { useState, useEffect } from 'react';
import { Wallet, History, AlertCircle, ArrowLeft, Send, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import socket from '../lib/socket';
import { useTranslation } from '../lib/i18n';

interface WithdrawViewProps {
  user: UserType | null;
  onBack: () => void;
  isMaintenance?: boolean;
  vipPlans?: any[];
}

export default function WithdrawView({ user, onBack, isMaintenance, vipPlans = [] }: WithdrawViewProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [channel, setChannel] = useState('M-Pesa (Vodacom)');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isWithinTimeRange = () => {
    if (!user) return false;
    const plan = (vipPlans || []).find(p => p.name === user.level) || (vipPlans && vipPlans[0]);
    const now = new Date();
    const today = now.getDay();
    
    if (plan && plan.withdrawalDay !== undefined) {
      if (today !== plan.withdrawalDay) return false;
    }

    if (!plan || !plan.withdrawalStart || !plan.withdrawalEnd) return true;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const [startH, startM] = plan.withdrawalStart.split(':').map(Number);
    const [endH, endM] = plan.withdrawalEnd.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    return currentTimeMinutes >= startTotal && currentTimeMinutes <= endTotal;
  };

  useEffect(() => {
    const handleReceived = (res: any) => {
      if (res.status === 'error') {
          alert(res.message);
          setIsProcessing(false);
          return;
      }
      alert(t('withdrawal_pending_msg'));
      setIsProcessing(false);
      setShowConfirm(false);
      onBack();
    };

    socket.on('withdrawal_received', handleReceived);
    return () => { socket.off('withdrawal_received', handleReceived); };
  }, [onBack, t]);

  const handleSubmitRequest = () => {
    setIsProcessing(true);
    const requestData = {
      phone: user?.phone,
      amount: parseFloat(amount),
      channel: channel,
      balanceBefore: user?.balance
    };
    socket.emit('submit_withdrawal', requestData);
  };

  const handleOpenConfirm = () => {
    if (isMaintenance) {
      alert(t('withdrawal_maintenance_alert'));
      return;
    }

    if (!isWithinTimeRange()) {
      const plan = (vipPlans || []).find(p => p.name === user?.level) || (vipPlans && vipPlans[0]);
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const today = new Date().getDay();

      if (plan && plan.withdrawalDay !== undefined && today !== plan.withdrawalDay) {
        alert(t('withdrawal_day_restriction', { level: user?.level || '', day: days[plan.withdrawalDay] }));
        return;
      }

      if (plan?.withdrawalStart && plan?.withdrawalEnd) {
        alert(t('withdrawal_time_restriction', { level: user?.level || '', start: plan?.withdrawalStart, end: plan?.withdrawalEnd }));
        return;
      }
      
      alert(t('withdrawal_generic_restriction'));
      return;
    }

    const val = parseFloat(amount);
    if (!amount || val < 100) {
      alert(t('invalid_amount'));
      return;
    }
    if (val > (user?.balance || 0)) {
      alert(t('insufficient_balance'));
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="animate-fade px-6 relative">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-text-secondary hover:text-accent transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-white font-serif italic text-2xl">{t('withdraw_view_title')}</h3>
        <div className="w-6"></div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <small className="text-text-secondary uppercase text-[10px] tracking-widest font-bold block mb-2 text-center">{t('withdrawable_balance')}</small>
        <div className="text-3xl font-serif text-accent text-center">MZN {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>

      <div className="space-y-6 mb-10">
        <div>
          <label className="text-[10px] uppercase font-black text-text-secondary tracking-[2px] block mb-3">{t('amount_to_withdraw')}</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount || 0}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('min_amount_placeholder')}
              className="w-full bg-surface border border-border p-4 rounded-xl text-white outline-none focus:border-accent transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-accent font-bold">MT</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-black text-text-secondary tracking-[2px] block mb-3">{t('payment_channel')}</label>
          <div className="relative">
            <select 
              value={channel || 'm-pesa'}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-surface border border-border p-4 rounded-xl text-white outline-none focus:border-accent transition-colors appearance-none"
            >
              <option>M-Pesa (Vodacom)</option>
              <option>e-Mola (Movitel)</option>
              <option>M-Kesh (Tmcel)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              <ArrowLeft size={16} className="-rotate-90" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenConfirm}
          className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-accent/10"
        >
          {t('request_withdrawal_btn')}
        </button>
      </div>

      <div className="bg-accent/5 border border-accent/20 p-5 rounded-xl flex gap-4">
        <AlertCircle className="text-accent shrink-0" size={20} />
        <div>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider leading-relaxed">
            {t('withdrawal_processing_desc')}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-bg/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-white font-serif text-xl mb-2 italic">{t('confirm_withdrawal')}</h4>
              <p className="text-text-secondary text-[11px] uppercase tracking-widest mb-8">{t('verify_transaction')}</p>
              
              <div className="bg-bg rounded-2xl p-6 mb-8 border border-border divide-y divide-border">
                <div className="pb-4 flex justify-between items-center text-left">
                  <span className="text-text-secondary text-[8px] uppercase font-black tracking-widest">{t('value')}</span>
                  <b className="text-white font-serif">{(parseFloat(amount) || 0).toLocaleString()} MT</b>
                </div>
                <div className="py-4 flex justify-between items-center text-left">
                  <span className="text-text-secondary text-[8px] uppercase font-black tracking-widest">{t('channel_label')}</span>
                  <b className="text-white text-[11px] font-bold uppercase">{channel}</b>
                </div>
                <div className="pt-4 flex justify-between items-center text-left">
                  <span className="text-accent text-[8px] uppercase font-black tracking-widest">{t('fee')}</span>
                  <b className="text-accent font-serif">{((parseFloat(amount) || 0) * 0.05).toLocaleString()} MT</b>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                   onClick={handleSubmitRequest}
                   disabled={isProcessing}
                   className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-bg border-t-transparent" />
                  ) : (
                    <>{t('continue_btn')} <CheckCircle2 size={16} /></>
                  )}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isProcessing}
                  className="w-full bg-transparent border border-border text-text-secondary font-bold py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-white/5"
                >
                  {t('cancel_btn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
