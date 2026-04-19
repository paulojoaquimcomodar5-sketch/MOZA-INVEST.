import { X, Upload } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onConfirm: (file: File | null) => void;
}

export default function PaymentModal({ onClose, onConfirm }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-bg/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-sm rounded-xl border border-border p-8 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-secondary hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-serif italic text-accent text-center mb-8 uppercase tracking-widest">Gestão de Investimentos</h3>
        
        <div className="bg-bg p-5 rounded-lg border border-border mb-8 text-xs leading-relaxed">
          <p className="mb-3 flex justify-between">
            <span className="text-text-secondary uppercase tracking-widest">M-Pesa</span>
            <span className="text-white font-bold">858778905 (PAULO JOAQUIM COMODALI)</span>
          </p>
          <p className="mb-3 flex justify-between">
            <span className="text-text-secondary uppercase tracking-widest">e-Mola</span>
            <span className="text-white font-bold">875376446 (LUISA ZULANE MALUMBE)</span>
          </p>
          <p className="mb-3 flex justify-between">
            <span className="text-text-secondary uppercase tracking-widest">PayPal</span>
            <span className="text-white font-bold">paulichocomedy@gmail.com</span>
          </p>
          <p className="flex justify-between">
            <span className="text-text-secondary uppercase tracking-widest">Centro de Apoio</span>
            <span className="text-white font-bold">+55 21 98124-5002</span>
          </p>
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
              onConfirm(fileInput.files?.[0] || null);
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
