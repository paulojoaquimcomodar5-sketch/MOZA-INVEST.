import React, { useState } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, AlertCircle, Info, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import socket from '../lib/socket';

interface LoanViewProps {
  user: UserType | null;
  onBack: () => void;
}

export default function LoanView({ user, onBack }: LoanViewProps) {
  const [amount, setAmount] = useState<string>('10000');
  const [period, setPeriod] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRequestLoan = () => {
    const val = parseInt(amount);
    if (isNaN(val) || val < 10000 || val > 100000) {
      alert("O valor do empréstimo deve ser entre 10.000 MT e 100.000 MT.");
      return;
    }

    if (user?.loanBalance && user.loanBalance > 0) {
      alert("Você já possui um empréstimo ativo. Liquide a dívida anterior para solicitar um novo crédito.");
      return;
    }

    setIsSubmitting(true);
    socket.emit('request_loan', { phone: user?.phone, amount: val, period });
    
    // Listen for response
    const handleResponse = (res: { success: boolean, message?: string }) => {
      setIsSubmitting(false);
      socket.off('loan_response', handleResponse);
      if (res.success) {
        setShowSuccess(true);
        setAmount('');
      } else {
        alert(res.message || "Erro ao processar pedido de crédito.");
      }
    };
    socket.on('loan_response', handleResponse);
  };

  const handleRepay = () => {
    if (!user?.loanBalance || user.loanBalance <= 0) return;
    if (user.balance < user.loanBalance) {
      alert("Saldo insuficiente na conta principal para liquidar o empréstimo.");
      return;
    }

    setIsSubmitting(true);
    socket.emit('repay_loan', { phone: user.phone });
    
    const handleResponse = (res: { success: boolean, message?: string }) => {
      setIsSubmitting(false);
      socket.off('loan_repayment_response', handleResponse);
      if (res.success) {
        alert("Empréstimo liquidado com sucesso! A sua credibilidade financeira foi atualizada.");
      } else {
        alert(res.message || "Erro ao processar liquidação.");
      }
    };
    socket.on('loan_repayment_response', handleResponse);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <CheckCircle2 className="text-emerald-400" size={40} />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2 italic">Pedido Enviado</h2>
        <p className="text-text-secondary text-xs uppercase tracking-widest leading-relaxed mb-10 max-w-xs">
          O seu pedido de crédito de <span className="text-white">{amount} MT</span> foi submetido para análise de risco. Receberá o capital em até 24h úteis.
        </p>
        <button 
          onClick={onBack}
          className="bg-accent text-bg font-black px-10 py-4 rounded-xl uppercase tracking-[2px] text-[10px] hover:opacity-90 active:scale-95 transition-all"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade px-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">Gestão de Crédito</h3>
        <button onClick={onBack} className="text-accent text-[8px] uppercase font-black tracking-widest border-b border-accent/30 pb-0.5">Sair</button>
      </div>

      {user?.loanBalance && user.loanBalance > 0 ? (
        <div className="bg-surface border border-red-500/30 p-8 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark size={80} />
          </div>
          <div className="relative z-10">
            <small className="text-red-400 font-black uppercase tracking-[2px] text-[9px] block mb-2">Dívida Ativa</small>
            <div className="text-3xl font-serif text-white mb-6">
              {(user?.loanBalance || 0).toLocaleString()} MT
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-bg/50 p-4 rounded-xl border border-white/5">
                  <small className="text-text-secondary text-[8px] uppercase tracking-widest block mb-1">Juros (Total)</small>
                  <b className="text-white text-xs">35% FIXO</b>
               </div>
               <div className="bg-bg/50 p-4 rounded-xl border border-white/5">
                  <small className="text-text-secondary text-[8px] uppercase tracking-widest block mb-1">Status</small>
                  <b className="text-emerald-400 text-xs">EM DIA</b>
               </div>
            </div>

            <button 
              onClick={handleRepay}
              disabled={isSubmitting}
              className="w-full bg-white text-bg font-black py-4 rounded-xl uppercase tracking-[2px] text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'PROCESSANDO...' : 'LIQUIDAR EMPRÉSTIMO'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-linear-to-br from-surface to-bg border border-border p-8 rounded-3xl mb-8 border-accent/20">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Landmark size={20} />
               </div>
               <div>
                  <h4 className="text-white font-serif text-lg">Limite Disponível</h4>
                  <p className="text-accent text-[9px] uppercase font-black tracking-widest">Aprovação Imediata</p>
               </div>
            </div>

            <div className="space-y-6">
               <div>
                  <div className="flex justify-between items-end mb-2">
                     <label className="text-text-secondary text-[10px] uppercase font-black tracking-widest">Montante do Crédito</label>
                     <span className="text-white font-serif text-sm italic">{amount || '10000'} MT</span>
                  </div>
                  <input 
                    type="range" 
                    min="10000" 
                    max="100000" 
                    step="5000"
                    value={amount || 0}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full accent-accent h-1 bg-border rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-[8px] font-bold text-text-secondary">
                     <span>10.000 MT</span>
                     <span>100.000 MT</span>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-end mb-2">
                     <label className="text-text-secondary text-[10px] uppercase font-black tracking-widest">Prazo de Pagamento</label>
                     <span className="text-white font-serif text-sm italic">{period} Dias</span>
                  </div>
                  <div className="flex gap-2">
                     {[30, 60, 90].map((d) => (
                       <button 
                         key={d}
                         onClick={() => setPeriod(d)}
                         className={`flex-1 py-3 rounded-xl border text-[10px] font-black transition-all ${period === d ? 'bg-accent border-accent text-bg' : 'bg-transparent border-white/10 text-white hover:border-white/30'}`}
                       >
                         {d} DIAS
                       </button>
                     ))}
                  </div>
               </div>

               <div className="p-4 bg-bg rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                     <span className="text-text-secondary">Montante a Receber (2.5x)</span>
                     <span className="text-emerald-400">+{Math.floor(parseInt(amount) * 2.5).toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                     <span className="text-text-secondary">Taxa de Juro (35%)</span>
                     <span className="text-white">+{Math.floor(parseInt(amount) * 2.5 * 0.35).toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                     <span className="text-text-secondary">Prazos</span>
                     <span className="text-white">{period} Dias</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center font-bold">
                     <span className="text-text-secondary text-[9px] uppercase tracking-widest">Total a Liquidar</span>
                     <span className="text-accent text-sm italic font-serif">{Math.floor(parseInt(amount) * 2.5 * 1.35).toLocaleString()} MT</span>
                  </div>
               </div>

               <button 
                onClick={handleRequestLoan}
                disabled={!amount || isSubmitting}
                className="w-full bg-accent text-bg font-black py-4 rounded-xl uppercase tracking-[2px] text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group"
               >
                 <span>SOLICITAR CAPITAL AGORA</span>
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-surface p-5 rounded-2xl border border-border">
               <ShieldCheck className="text-accent mb-3" size={20} />
               <h5 className="text-white font-serif text-xs mb-1">Garantia Moza</h5>
               <p className="text-text-secondary text-[8px] leading-relaxed uppercase tracking-widest">Proteção total do seu capital de investimento.</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-border">
               <Clock className="text-accent mb-3" size={20} />
               <h5 className="text-white font-serif text-xs mb-1">Análise Rápida</h5>
               <p className="text-text-secondary text-[8px] leading-relaxed uppercase tracking-widest">Processamento automatizado pela rede neural.</p>
            </div>
          </div>
        </>
      )}

      {/* Loan History Section */}
      <div className="mt-12 mb-8 animate-fade">
        <div className="flex items-center gap-2 mb-6">
          <History size={18} className="text-accent" />
          <h4 className="text-white font-serif text-lg italic">Histórico de Crédito</h4>
        </div>

        {user?.loanHistory && user.loanHistory.length > 0 ? (
          <div className="space-y-4">
            {[...user.loanHistory].reverse().map((loan) => (
              <div key={loan.id} className="bg-surface border border-border p-5 rounded-2xl flex justify-between items-center group hover:border-accent/30 transition-colors">
                <div className="space-y-1">
                  <div className="text-xs font-serif text-white">{(loan.amount || 0).toLocaleString()} MT</div>
                  <div className="flex gap-2 text-[7px] text-text-secondary uppercase tracking-widest font-black">
                    <span>{new Date(loan.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-accent">{loan.period || 30} DIAS</span>
                    <span>•</span>
                    <span className="text-emerald-400">TOTAL: {(loan.totalToRepay || (loan.amount * 1.35)).toLocaleString()} MT</span>
                  </div>
                </div>
                
                <div className="text-right">
                   <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                     loan.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                     loan.status === 'REPAID' ? 'bg-accent/10 text-accent' :
                     loan.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                     'bg-yellow-500/10 text-yellow-500'
                   }`}>
                     {loan.status === 'PENDING' ? 'Pendente' : 
                      loan.status === 'APPROVED' ? 'Aprovado' : 
                      loan.status === 'REJECTED' ? 'Recusado' : 
                      'Liquidado'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-dashed border-border py-12 rounded-3xl flex flex-col items-center justify-center text-center">
             <Info className="text-text-secondary opacity-20 mb-4" size={32} />
             <p className="text-text-secondary text-[10px] uppercase tracking-widest font-black">Nenhum registo encontrado</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-4 items-start mt-8">
         <AlertCircle className="text-red-400 shrink-0" size={18} />
         <div>
            <p className="text-white font-bold text-[10px] uppercase mb-1">Aviso de Responsabilidade</p>
            <p className="text-text-secondary text-[9px] leading-relaxed">
              O não pagamento do empréstimo no prazo estipulado resultará na suspensão temporária dos rendimentos diários e bloqueio de saques.
            </p>
         </div>
      </div>
    </div>
  );
}
