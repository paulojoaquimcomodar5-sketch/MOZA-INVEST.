import { User, Wallet, History, Shield, Settings, ChevronRight, LogOut } from 'lucide-react';
import { Tab, User as UserType } from '../types';

interface ProfileViewProps {
  user: UserType | null;
  onLogout: () => void;
  onWithdraw: () => void;
  onNavigate: (tab: Tab) => void;
}

export default function ProfileView({ user, onLogout, onWithdraw, onNavigate }: ProfileViewProps) {
  const menuItems = [
    { id: 'reports', label: 'Relatórios de Lucro', Icon: History },
    { id: 'history', label: 'Histórico de Saques', Icon: Wallet },
    { id: 'security', label: 'Segurança da Conta', Icon: Shield },
    { id: 'settings', label: 'Configurações', Icon: Settings },
  ] as const;

  return (
    <div className="animate-fade px-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">O Meu Perfil</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
        <div className="w-20 h-20 bg-bg border-4 border-surface rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-xl ring-2 ring-accent/20">
          <User className="text-accent" size={40} />
        </div>
        <h4 className="text-white text-xl font-serif">{user?.phone}</h4>
        <p className="text-accent text-[10px] uppercase tracking-[3px] font-bold mt-1">{user?.level}</p>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 flex justify-between items-center mb-8">
        <div>
          <small className="text-text-secondary uppercase text-[9px] tracking-widest block mb-1">Total Consolidado</small>
          <div className="text-2xl font-serif text-white">MZN {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <button 
          onClick={onWithdraw}
          className="bg-accent text-bg font-bold py-2 px-6 rounded text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
        >
          SACAR
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-surface border border-border p-5 rounded-xl">
          <small className="text-text-secondary uppercase text-[8px] tracking-[2px] block mb-1 font-bold">Total Lucro</small>
          <div className="text-lg font-serif text-white">450.00 MT</div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <small className="text-text-secondary uppercase text-[8px] tracking-[2px] block mb-1 font-bold">Pontos Sorte</small>
          <div className="text-lg font-serif text-accent">{user?.tickets || 0} PTS</div>
        </div>
      </div>

      <div className="space-y-3 mb-10">
        {menuItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => onNavigate(item.id)}
            className="w-full bg-surface border border-border p-5 rounded-xl flex items-center justify-between group hover:border-accent/40 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-accent">
                <item.Icon size={18} />
              </div>
              <span className="text-text-secondary text-xs uppercase tracking-widest font-bold group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
            <ChevronRight size={18} className="text-border group-hover:text-accent transition-colors" />
          </button>
        ))}

        <button 
          onClick={onLogout}
          className="w-full bg-red-500/10 border border-red-500/20 p-5 rounded-xl flex items-center justify-between group hover:bg-red-500/20 active:scale-95 transition-all mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-red-500">
              <LogOut size={18} />
            </div>
            <span className="text-red-500 text-xs uppercase tracking-widest font-bold">
              Encerrar Sessão
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
