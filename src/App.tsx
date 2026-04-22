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
  ShieldCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Tab, User as UserType, VIPPlan } from './types';
import BannerCarousel from './components/BannerCarousel';
import VIPCard from './components/VIPCard';
import NavBar from './components/NavBar';
import PaymentModal from './components/PaymentModal';
import LotteryScreen from './components/LotteryScreen';
import Logo from './components/Logo';
import SupportBanner from './components/SupportBanner';
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
  const [activatingPlan, setActivatingPlan] = useState<VIPPlan | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({ phone: '', pass: '', invite: '' });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [appStatus, setAppStatus] = useState({ status: 'OPEN', message: '' });
  const [prizes, setPrizes] = useState<any[]>([]);

  const isUserAdmin = user?.phone === '+55 21 98124-5002';
  const maintenanceActive = !isUserAdmin && appStatus.status !== 'OPEN';

  // Global Socket Listeners (only mount once)
  useEffect(() => {
    const onConnect = () => {
      setIsSocketConnected(true);
      socket.emit('get_app_status');
    };
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      onConnect();
    }

    socket.on('app_status_update', (data) => {
      setAppStatus(data);
    });

    socket.on('prizes_update', (data) => {
      setPrizes(data);
    });

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
        alert("Bem-vindo à MOZA INV GOLD! A sua conta foi ativada com sucesso.");
        setIsRegisterMode(false);
      } else {
        alert(res.message);
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('app_status_update');
      socket.off('login_response');
      socket.off('registration_response');
    };
  }, []);

  // User-dependent Socket Listeners
  useEffect(() => {
    if (!user) return;

    const handleUserDataUpdate = (updatedUser: any) => {
      if (updatedUser.phone === user?.phone) {
        setUser(updatedUser);
        localStorage.setItem('moza_user', JSON.stringify(updatedUser));
      }
    };

    const handleItemStatusUpdate = (item: any) => {
      if (item.user === user?.phone) {
        if (item.status === 'APPROVED') {
          alert(`PARABÉNS! O seu ${item.type} de ${item.data.amount} MT foi APROVADO.`);
          if (item.updatedUser) {
            setUser(item.updatedUser);
            localStorage.setItem('moza_user', JSON.stringify(item.updatedUser));
          }
        } else if (item.status === 'REJECTED') {
          alert(`AVISO: O seu ${item.type} foi recusado pelo Administrador.`);
        }
      }
    };

    const handleWithdrawalStatusUpdate = (w: any) => {
      if (w.phone === user?.phone) {
        if (w.status === 'APPROVED') {
          alert(`SAQUE APROVADO! O valor de ${w.amount} MT foi enviado via ${w.channel}.`);
          if (w.updatedUser) {
            setUser(w.updatedUser);
            localStorage.setItem('moza_user', JSON.stringify(w.updatedUser));
          }
        } else if (w.status === 'REJECTED') {
          alert(`SAQUE RECUSADO: Entre em contacto com o suporte para mais informações.`);
        }
      }
    };

    socket.on('user_data_updated', handleUserDataUpdate);
    socket.on('item_status_update', handleItemStatusUpdate);
    socket.on('item_status_updated', handleItemStatusUpdate); // Catch both versions
    socket.on('withdrawal_status_updated', handleWithdrawalStatusUpdate);

    return () => {
      socket.off('user_data_updated', handleUserDataUpdate);
      socket.off('item_status_update', handleItemStatusUpdate);
      socket.off('item_status_updated', handleItemStatusUpdate);
      socket.off('withdrawal_status_updated', handleWithdrawalStatusUpdate);
    };
  }, [user?.phone]); // Only re-run if phone number changes

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
    if (!isSocketConnected) {
      return alert("A estabelecer ligação com o servidor... Por favor, aguarde um momento.");
    }
    if (authForm.phone.length < 3) return alert("Insira um número válido");
    
    setIsAuthLoading(true);
    if (isRegisterMode) {
      if (!authForm.invite || !authForm.pass) {
        setIsAuthLoading(false);
        return alert("Código de Convite e Palavra-passe são obrigatórios!");
      }

      // Invite Code Validation
      if (authForm.invite.length < 6) {
        setIsAuthLoading(false);
        return alert("O Código de Convite deve ter no mínimo 6 caracteres.");
      }
      
      const isAlphanumeric = /^[a-z0-9]+$/i.test(authForm.invite);
      if (!isAlphanumeric) {
        setIsAuthLoading(false);
        return alert("O Código de Convite deve conter apenas letras e números.");
      }

      socket.emit('register_user', { 
        phone: authForm.phone, 
        password: authForm.pass, 
        inviteCode: authForm.invite 
      });
    } else {
      if (!authForm.pass) {
        setIsAuthLoading(false);
        return alert("A palavra-passe é obrigatória!");
      }
      socket.emit('login_request', { 
        phone: authForm.phone, 
        password: authForm.pass 
      });
    }
  };

  const activateVIP = (plan: VIPPlan) => {
    if (!user) return;
    if (user.level === plan.name) return alert("Você já possui este plano ativo.");
    
    setActivatingPlan(plan);
    setShowPayment(true);
  };

  useEffect(() => {
    socket.on('vip_activated', (res) => {
      if (res.success) {
        alert(`PARABÉNS! ${res.message}`);
        setUser(res.user);
        localStorage.setItem('moza_user', JSON.stringify(res.user));
      } else {
        alert(res.message);
      }
    });

    return () => {
      socket.off('vip_activated');
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('moza_user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdminView(false);
    setActiveTab('home');
    setAuthForm({ phone: '', pass: '', invite: '' });
  };

  const handlePaymentConfirm = (file: File | null, amount: number, type?: 'PAYMENT' | 'VIP_UPGRADE') => {
    if (file && user) {
      if (amount <= 0) return alert("Insira um valor válido");
      socket.emit('submit_for_approval', {
        type: type || 'PAYMENT',
        user: user.phone,
        data: { 
          fileName: file.name, 
          amount: amount, 
          planName: activatingPlan?.name,
          planId: activatingPlan?.id 
        }
      });
      
      if (type === 'VIP_UPGRADE') {
        alert(`Pedido de Ativação do ${activatingPlan?.name} enviado! O ADM Paulo Joaquim analisará o comprovativo.`);
      } else {
        alert("Recebido! O ADM Paulo Joaquim analisará o comprovativo em instantes.");
      }
      
      setShowPayment(false);
      setActivatingPlan(null);
    } else {
      alert("Por favor, selecione a foto do recibo.");
    }
  };

  const handleDraw = (cost: number, win: number, isTicket: boolean) => {
    if (!user) return;
    
    let newBalance = user.balance;
    let newTickets = user.tickets;

    if (cost > 0) {
      if (isTicket) {
        newTickets -= 1;
      } else {
        newBalance -= cost;
        // In a real app, we'd emit a balance deduction to the server here
        socket.emit('update_user_balance', { phone: user.phone, amount: -cost });
      }
    }

    const updatedUser = {
      ...user,
      balance: newBalance,
      tickets: newTickets
    };
    setUser(updatedUser);
    localStorage.setItem('moza_user', JSON.stringify(updatedUser));

    if (win > 0) {
      socket.emit('submit_for_approval', {
        type: 'LOTTERY',
        user: user.phone,
        data: { amount: win }
      });
      alert(`VITÓRIA! Ganhou ${win} MT. O prémio foi enviado para aprovação do Administrador.`);
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Urgent News Ticker */}
            {appStatus.status === 'RESTRICTED' && (
              <div className="bg-blue-500/10 border-b border-blue-500/20 py-3 px-6 -mx-6 mb-4 flex items-center gap-3">
                 <AlertCircle size={16} className="text-blue-400 shrink-0" />
                 <p className="text-[10px] text-blue-100/80 leading-tight uppercase font-medium tracking-wider">
                    <b className="text-blue-400">RESTRIÇÃO TEMPORÁRIA:</b> Levantamentos e Tarefas pausados para auditoria. Navegação livre.
                 </p>
              </div>
            )}
            <div className="bg-accent/10 border-y border-accent/20 mb-6 -mx-6 py-2 overflow-hidden whitespace-nowrap relative">
               <div className="flex animate-marquee gap-10">
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-accent flex items-center gap-2">
                    <Headset size={10} /> SUPORTE EXCLUSIVO: Paulo Joaquim disponível via WhatsApp 24/7 para membros VIP. 
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-white flex items-center gap-2">
                    <Zap size={10} /> NOTÍCIA: Novos pagamentos VIP 4 efetuados com sucesso!
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-accent flex items-center gap-2">
                    <Gem size={10} /> Moza Inv Gold atinge valorização recorde de 24% este mês.
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
                  onJoin={() => activateVIP(plan)} 
                  userLevel={user?.level}
                />
              ))}
            </div>

            <PrizeShowcase prizes={prizes} />
          </>
        );
      case 'tasks':
        return <InvestmentsView user={user} isMaintenance={maintenanceActive} />;
      case 'vip':
        return <VIPView user={user} onActivate={activateVIP} />;
      case 'team':
        return <TeamView />;
      case 'withdraw':
        return <WithdrawView user={user} onBack={() => setActiveTab('home')} isMaintenance={maintenanceActive} />;
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

  // Maintenance Check (Global Lock)
  if (!isAdminView && !isUserAdmin && (appStatus.status === 'MAINTENANCE' || appStatus.status === 'CLOSED')) {
     return (
       <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/20 animate-pulse">
            <Lock className="text-accent" size={40} />
         </div>
         <h1 className="text-2xl font-serif text-white mb-2 italic">Acesso Restrito</h1>
         <p className="text-text-secondary text-sm max-w-xs mb-8 leading-relaxed">
           {appStatus.message || "A plataforma está em manutenção programada para melhorias na segurança."}
         </p>
         <div className="p-4 bg-surface rounded-xl border border-border w-full max-w-sm mb-12">
            <p className="text-[10px] text-accent uppercase tracking-widest font-bold mb-1">Status do Sistema</p>
            <p className="text-white font-medium text-xs">
              {appStatus.status === 'MAINTENANCE' ? '🔴 MANUTENÇÃO TEMPORÁRIA' : '🚫 SUSPENSÃO PERMANENTE'}
            </p>
         </div>
         
         <div className="space-y-4 w-full max-w-xs">
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-accent transition-colors"
            >
              Sou Administrador
            </button>
         </div>

         {!isAuthenticated && isRegisterMode && (
            <div className="mt-8 p-6 bg-surface rounded-2xl border border-border w-full max-w-sm animate-fade shadow-2xl">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                     <ShieldCheck size={18} />
                  </div>
                  <p className="text-white text-[12px] font-serif italic">Portal de Comando</p>
               </div>
               <input 
                  type="password" 
                  autoFocus
                  placeholder="Código de Acesso Master"
                  className="w-full bg-bg border border-border p-4 rounded-xl mb-4 text-white text-sm outline-none focus:border-accent"
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter' && e.target.value === 'admin') {
                      setIsAdminView(true);
                      setIsAuthenticated(true);
                      setUser({ phone: '+55 21 98124-5002', name: 'ADMIN', balance: 1000000, fundBalance: 0, totalProfit: 0, level: 'VIP 4', tickets: 0, inviteCode: 'ADMIN' });
                    }
                  }}
               />
               <p className="text-[9px] text-text-secondary uppercase tracking-widest">Insira o código e pressione Enter</p>
            </div>
         )}
       </div>
     );
  }

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
                type="tel" 
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
              disabled={isAuthLoading || (!isSocketConnected && !isRegisterMode)}
              className={`w-full bg-accent text-bg font-bold py-4 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all mt-6 uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isAuthLoading || (!isSocketConnected && !isRegisterMode) ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isAuthLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  <span>PROCESSANDO...</span>
                </>
              ) : !isSocketConnected && !isRegisterMode ? (
                <>
                  <div className="w-2 h-2 bg-bg rounded-full animate-pulse" />
                  <span>LIGANDO...</span>
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
          isMaintenance={maintenanceActive}
        />
      ) : (
        <>
          {/* Header */}
          <header className="bg-surface border-b border-border p-5 sticky top-0 z-40 backdrop-blur-md bg-surface/80">
            {isUserAdmin && appStatus.status !== 'OPEN' && (
              <div className={`-mt-5 -mx-5 mb-4 p-2 text-center text-[9px] font-black uppercase tracking-[3px] ${
                appStatus.status === 'RESTRICTED' ? 'bg-blue-500 text-white' :
                appStatus.status === 'MAINTENANCE' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
              }`}>
                ⚠️ MODO {appStatus.status} ATIVO PARA TODOS OS USUÁRIOS
              </div>
            )}
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
          onClose={() => {
            setShowPayment(false);
            setActivatingPlan(null);
          }} 
          onConfirm={handlePaymentConfirm} 
          initialAmount={activatingPlan?.price}
          title={activatingPlan ? `Ativar ${activatingPlan.name}` : undefined}
        />
      )}

      {/* Bottom Nav */}
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
