import { useState, useEffect } from 'react';
import { 
  CircleDollarSign, 
  ArrowUpRight, 
  Users, 
  TrendingUp, 
  FileText, 
  Building2, 
  Headset, 
  FerrisWheel,
  LogOut,
  Smartphone,
  Lock,
  UserPlus,
  ShieldAlert,
  Zap,
  Gem,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Tab, User as UserType, VIPPlan } from './types';
import BannerCarousel from './components/BannerCarousel';
import VIPCard from './components/VIPCard';
import NavBar from './components/NavBar';
import PaymentModal from './components/PaymentModal';
import LotteryScreen from './components/LotteryScreen';
import Logo from './components/Logo';
import InvestmentsView from './components/InvestmentsView';
import VIPView from './components/VIPView';
import TeamView from './components/TeamView';
import ProfileView from './components/ProfileView';
import WithdrawView from './components/WithdrawView';
import FundView from './components/FundView';
import CompanyView, { SupportView } from './components/CompanyInfo';
import { ProfitReportsView, WithdrawalHistoryView, SecurityView, SettingsView } from './components/ProfileSubViews';
import CommunityChatView from './components/CommunityChatView';
import PrizeShowcase from './components/PrizeShowcase';
import AdminDashboard from './components/AdminDashboard';
import socket from './lib/socket';
import { VIP_PLANS } from './constants';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showPayment, setShowPayment] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({ phone: '', pass: '', invite: '' });
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Socket Listeners for Approvals
  useEffect(() => {
    socket.on('login_response', (res) => {
      setIsAuthLoading(false);
      if (res.success) {
        setUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('moza_user', JSON.stringify(res.user));
      } else {
        alert(res.message);
      }
    });

    socket.on('registration_response', (res) => {
      setIsAuthLoading(false);
      if (res.success) {
        alert("Registo enviado com sucesso! Faça login agora.");
        setIsRegisterMode(false);
      } else {
        alert(res.message);
      }
    });

    socket.on('item_status_updated', (item) => {
      if (item.user === user?.phone && item.status === 'APPROVED') {
        alert(`PARABÉNS! O seu ${item.type} foi APROVADO.`);
        // Note: Real balance would be updated on re-login or fetched periodically
      }
    });

    return () => {
      socket.off('login_response');
      socket.off('registration_response');
      socket.off('item_status_updated');
    };
  }, [user]);

  // Load user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('moza_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = () => {
    if (authForm.phone.length < 5) return alert("Insira um número válido");
    
    setIsAuthLoading(true);
    if (isRegisterMode) {
      if (!authForm.invite || !authForm.pass) {
        setIsAuthLoading(false);
        return alert("Código de Convite e Palavra-passe são obrigatórios!");
      }
      socket.emit('register_user', { 
        phone: authForm.phone, 
        password: authForm.pass, 
        inviteCode: authForm.invite 
      });
    } else {
      socket.emit('login_request', { 
        phone: authForm.phone, 
        password: authForm.pass 
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('moza_user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdminView(false);
    setActiveTab('home');
    setAuthForm({ phone: '', pass: '', invite: '' });
  };

  const handlePaymentConfirm = (file: File | null) => {
    if (file && user) {
      socket.emit('submit_for_approval', {
        type: 'PAYMENT',
        user: user.phone,
        data: { fileName: file.name }
      });
      alert("Recebido! O ADM Paulo Joaquim analisará o comprovativo em instantes.");
      setShowPayment(false);
    } else {
      alert("Por favor, selecione a foto do recibo.");
    }
  };

  const handleDraw = (cost: number, win: number, ticketWin: boolean) => {
    if (!user) return;
    
    // Immediate ticket deduction
    const updatedUser = {
      ...user,
      tickets: user.tickets - (cost === 0 ? 1 : 0) + (ticketWin ? 1 : 0)
    };
    setUser(updatedUser);

    if (win > 0) {
      socket.emit('submit_for_approval', {
        type: 'LOTTERY',
        user: user.phone,
        data: { amount: win }
      });
      alert(`VITÓRIA! Ganhou ${win} MT. O prémio foi enviado para aprovação do Administrador.`);
    }
    localStorage.setItem('moza_user', JSON.stringify(updatedUser));
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Urgent News Ticker */}
            <div className="bg-accent/10 border-y border-accent/20 mb-6 -mx-6 py-2 overflow-hidden whitespace-nowrap relative">
               <div className="flex animate-marquee gap-10">
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-accent flex items-center gap-2">
                    <Zap size={10} /> NOTÍCIA: Paulo Joaquim confirma novos pagamentos VIP 4 efetuados com sucesso!
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-white flex items-center gap-2">
                    <Gem size={10} /> Moza Inv Gold atinge valorização recorde de 24% este mês.
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-accent flex items-center gap-2">
                    <Crown size={10} /> Promoção: Utilize o código MOZA2026 para bónus de boas-vindas.
                  </span>
               </div>
            </div>

            <BannerCarousel />

            <div className="bg-bg p-6 rounded-xl border border-border mt-6 mb-8 flex justify-between items-center shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="space-y-1">
                <small className="text-text-secondary font-bold uppercase tracking-[1.5px] text-[10px]">Saldo Disponível</small>
                <div className="text-3xl font-serif text-accent">
                  MZN {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right space-y-1">
                <small className="text-text-secondary font-bold uppercase tracking-[1.5px] text-[10px]">Classe VIP</small>
                <div className="text-white font-bold italic font-serif">{user?.level}</div>
              </div>
            </div>

            {/* QUICK STATS / "AND MUCH MORE" */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-surface border border-border p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                     <TrendingUp size={14} className="text-emerald-400" />
                     <small className="text-[8px] uppercase font-black tracking-widest text-text-secondary">Crescimento 24h</small>
                  </div>
                  <b className="text-white text-lg font-serif">+12.4%</b>
               </div>
               <div className="bg-surface border border-border p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                     <ShieldCheck size={14} className="text-blue-400" />
                     <small className="text-[8px] uppercase font-black tracking-widest text-text-secondary">Segurança</small>
                  </div>
                  <b className="text-white text-lg font-serif">SSL 256</b>
               </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { id: 'recharge', label: 'Recarga', Icon: CircleDollarSign, color: 'text-accent', bg: 'bg-accent-muted', action: () => setShowPayment(true) },
                { id: 'withdraw', label: 'Saque', Icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('withdraw') },
                { id: 'lottery', label: 'Lotaria', Icon: FerrisWheel, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('lottery') },
                { id: 'team', label: 'Equipe', Icon: Users, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('team') },
                { id: 'fund', label: 'Fundo', Icon: TrendingUp, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('fund') },
                { id: 'task', label: 'Tarefa', Icon: FileText, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('tasks') },
                { id: 'company', label: 'Empresa', Icon: Building2, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('company') },
                { id: 'support', label: 'Suporte', Icon: Headset, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('support') }
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={item.action}
                  className="flex flex-col items-center gap-3 bg-surface border border-border p-4 rounded-xl hover:border-accent/40 active:scale-95 transition-all group"
                >
                  <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-full flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <item.Icon size={18} />
                  </div>
                  <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-white font-serif italic text-xl">Planos de Capital</h3>
              <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
            </div>

            <div className="space-y-4">
              {VIP_PLANS.map((plan) => (
                <VIPCard 
                  key={plan.id} 
                  plan={plan} 
                  onJoin={() => setShowPayment(true)} 
                />
              ))}
            </div>

            <PrizeShowcase />
          </>
        );
      case 'tasks':
        return <InvestmentsView user={user} />;
      case 'vip':
        return <VIPView />;
      case 'team':
        return <TeamView />;
      case 'withdraw':
        return <WithdrawView user={user} onBack={() => setActiveTab('home')} />;
      case 'fund':
        return <FundView user={user} />;
      case 'company':
        return <CompanyView />;
      case 'support':
        return <SupportView onNavigate={setActiveTab} />;
      case 'chat':
        return <CommunityChatView user={user} onBack={() => setActiveTab('support')} />;
      case 'reports':
        return <ProfitReportsView onBack={() => setActiveTab('me')} />;
      case 'history':
        return <WithdrawalHistoryView onBack={() => setActiveTab('me')} />;
      case 'security':
        return <SecurityView onBack={() => setActiveTab('me')} />;
      case 'settings':
        return <SettingsView onBack={() => setActiveTab('me')} />;
      case 'me':
        return <ProfileView user={user} onLogout={logout} onWithdraw={() => setActiveTab('withdraw')} onNavigate={setActiveTab} />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface p-10 rounded-2xl w-full max-w-sm border border-border text-center shadow-2xl"
        >
          <Logo size="lg" className="mb-10" />
          
          <div className="space-y-5">
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input 
                type="text" 
                placeholder="Telemóvel"
                className="w-full bg-bg border border-border py-3 pl-10 pr-4 rounded-lg text-white outline-none focus:border-accent transition-colors text-sm"
                value={authForm.phone}
                onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input 
                type="password" 
                placeholder="Palavra-passe"
                className="w-full bg-bg border border-border py-3 pl-10 pr-4 rounded-lg text-white outline-none focus:border-accent transition-colors text-sm"
                value={authForm.pass}
                onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })}
              />
            </div>

            {isRegisterMode && (
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type="text" 
                  placeholder="Código de Convite"
                  className="w-full bg-bg border border-border py-3 pl-10 pr-4 rounded-lg text-white outline-none focus:border-accent transition-colors text-sm"
                  value={authForm.invite}
                  onChange={(e) => setAuthForm({ ...authForm, invite: e.target.value })}
                />
              </div>
            )}
            
            <button 
              onClick={handleAuth}
              disabled={isAuthLoading}
              className={`w-full bg-accent text-bg font-bold py-4 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all mt-6 uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isAuthLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  <span>PROCESSANDO...</span>
                </>
              ) : (
                isRegisterMode ? 'SOLICITAR ACESSO' : 'ENTRAR'
              )}
            </button>
            
            <p className="text-[10px] uppercase tracking-wider text-text-secondary mt-8">
              {isRegisterMode ? 'Já possui acesso? ' : 'Não possui acesso? '}
              <button 
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-accent font-bold hover:underline"
              >
                {isRegisterMode ? 'Faça Login' : 'Registe-se'}
              </button>
            </p>

            <div className="pt-6 border-t border-white/5 opacity-40">
               <p className="text-[8px] uppercase tracking-widest text-text-secondary leading-relaxed">
                 {isRegisterMode 
                   ? 'O registo requer aprovação prévia e o código de convite oficial da MOZA INV.' 
                   : 'Administrador via WhatsApp para recuperação de credenciais.'}
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24 font-sans text-white">
      {isAdminView ? (
        <AdminDashboard onBack={() => setIsAdminView(false)} />
      ) : activeTab === 'lottery' ? (
        <LotteryScreen 
          onBack={() => setActiveTab('home')}
          balance={user?.balance || 0}
          tickets={user?.tickets || 0}
          onDraw={handleDraw}
          onRecharge={() => setShowPayment(true)}
        />
      ) : (
        <>
          {/* Header */}
          <header className="bg-surface border-b border-border p-5 sticky top-0 z-40 backdrop-blur-md bg-surface/80">
            <div className="flex justify-between items-center">
              <Logo size="sm" />
              <div className="flex items-center gap-3">
                <span className="bg-accent-muted text-accent font-bold text-[9px] py-1 px-3 rounded-sm border border-accent/20 tracking-widest">
                  ID: {user?.inviteCode}
                </span>
                {user?.phone === '+55 21 98124-5002' && (
                  <button 
                    onClick={() => setIsAdminView(true)}
                    className="text-accent hover:text-white transition-colors bg-accent/10 p-2 rounded-lg border border-accent/20"
                  >
                    <ShieldAlert size={16} />
                  </button>
                )}
                <button onClick={logout} className="text-text-secondary hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="p-6">
            {renderView()}
          </main>
        </>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal 
          onClose={() => setShowPayment(false)} 
          onConfirm={handlePaymentConfirm} 
        />
      )}

      {/* Bottom Nav */}
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
