import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onConfirm: (file: File | null, amount: number, type?: 'PAYMENT' | 'VIP_UPGRADE') => void;
  initialAmount?: number;
  title?: string;
  paymentMethods?: {
    mpesa: string;
    emola: string;
    paypal: string;
  };
}

export default function PaymentModal({ onClose, onConfirm, initialAmount, title, paymentMethods }: PaymentModalProps) {
  const [val, setVal] = useState(initialAmount?.toString() || '500');

  const methods = paymentMethods || {
    mpesa: "Aguardando...",
    emola: "Aguardando...",
    paypal: "Aguardando..."
  };

  return (
    <div className="fixed inset-0 bg-bg/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-sm rounded-xl border border-border p-8 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-secondary hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-serif italic text-accent text-center mb-8 uppercase tracking-widest leading-tight">
          {title || 'Gestão de Investimentos'}
        </h3>
        
        <div className="bg-bg p-5 rounded-lg border border-border mb-8 text-xs leading-relaxed">
          <p className="mb-3 flex justify-between gap-4">
            <span className="text-text-secondary uppercase tracking-widest shrink-0">M-Pesa</span>
            <span className="text-white font-bold text-right break-words">{methods.mpesa}</span>
          </p>
          <p className="mb-3 flex justify-between gap-4">
            <span className="text-text-secondary uppercase tracking-widest shrink-0">e-Mola</span>
            <span className="text-white font-bold text-right break-words">{methods.emola}</span>
          </p>
          <p className="mb-3 flex justify-between gap-4">
            <span className="text-text-secondary uppercase tracking-widest shrink-0">PayPal</span>
            <span className="text-white font-bold text-right break-words">{methods.paypal}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-text-secondary uppercase tracking-widest shrink-0">Apoio</span>
            <span className="text-white font-bold text-right">+55 21 98124-5002</span>
          </p>
        </div>
        
        <div className="mb-6">
          <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3 block">Valor da Recarga (MT)</label>
          <input 
            type="number" 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-bg border border-border p-3 rounded-lg text-white font-bold outline-none focus:border-accent text-sm"
          />
        </div>

        <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3">Comprovativo de Transação</p>
        <div className="flex flex-col gap-5">
          <input 
            type="file" 
            id="recibo" 
            accept="image/*"
            className="w-full text-xs text-text-secondary file:mr-4 file:py-2.5 file:px-6 file:rounded file:border file:border-border file:text-[10px] file:font-bold file:uppercase file:bg-surface file:text-white hover:file:bg-white/5"
          />
          
          <button 
            onClick={() => {
              const fileInput = document.getElementById('recibo') as HTMLInputElement;
              const type = title?.includes('VIP') ? 'VIP_UPGRADE' : 'PAYMENT';
              onConfirm(fileInput.files?.[0] || null, parseInt(val) || 0, type);
            }}
            className="w-full bg-accent text-bg font-bold py-4 rounded font-sans text-xs uppercase tracking-[2px] shadow-lg shadow-accent/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Upload size={16} />
            ENVIAR COMPROVATIVO
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-transparent border border-border text-text-secondary font-bold py-3 rounded text-[10px] uppercase tracking-widest hover:bg-white/5 active:scale-95 transition-all"
          >
            VOLTAR
          </button>
        </div>
      </div>
    </div>
  );
}
