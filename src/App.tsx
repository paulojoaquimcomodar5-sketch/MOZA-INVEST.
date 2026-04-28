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
  Eye,
  EyeOff,
  UserPlus,
  ShieldAlert,
  Zap,
  Gem,
  Crown,
  ShieldCheck,
  ShieldCheck as ShieldCheckIcon,
  Shield,
  AlertCircle,
  CheckCircle2,
  Bomb,
  Gift,
  Landmark,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import SuccessCelebration from './components/SuccessCelebration';
import MinesGame from './components/MinesGame';
import WelcomeModal from './components/WelcomeModal';
import LoanView from './components/LoanView';
import socket from './lib/socket';
import { auth, signInAnonymously } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from './lib/i18n';

export default function App() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activatedPlanName, setActivatedPlanName] = useState('');
  const [activatingPlan, setActivatingPlan] = useState<VIPPlan | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({ phone: '', pass: '', invite: '' });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch Initial Data via REST for extreme speed
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/initial-data');
        const data = await response.json();
        setFunds(data.funds || []);
        setVipPlans(data.vipPlans || []);
        setPrizes(data.prizes || []);
        setAppStatus(prev => ({ 
          ...prev, 
          status: data.status || 'OPEN', 
          welcomeSettings: data.welcomeSettings || prev.welcomeSettings 
        }));
        setIsInitializing(false);
      } catch (err) {
        console.error("Failed to fetch initial data via REST:", err);
        setIsInitializing(false);
      }
    };
    fetchInitialData();
  }, []);

  const [appStatus, setAppStatus] = useState({ 
    status: 'OPEN', 
    message: '',
    welcomeSettings: {
      active: true,
      title: "Olá, {name}!",
      message: "A sua jornada para a elite financeira continua. Comece as suas tarefas diárias para maximizar os rendimentos."
    }
  });
  const [prizes, setPrizes] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [vipPlans, setVipPlans] = useState<any[]>([
    { id: '1', name: 'VIP 1', price: 500, daily: 36, tasks: 5, taskEarning: 7.2, color: '#D4AF37', icon: 'zap', withdrawalDay: 5 },
    { id: '2', name: 'VIP 2', price: 2000, daily: 154, tasks: 10, taskEarning: 15.4, color: '#4A90E2', icon: 'diamond', withdrawalDay: 2 },
    { id: '3', name: 'VIP 3', price: 6000, daily: 480, tasks: 15, taskEarning: 32, color: '#10B981', icon: 'crown', withdrawalDay: 3 },
    { id: '4', name: 'VIP 4', price: 15000, daily: 1250, tasks: 20, taskEarning: 62.5, color: '#8B5CF6', icon: 'flame', withdrawalDay: 2 },
    { id: '5', name: 'VIP 5', price: 40000, daily: 3500, tasks: 30, taskEarning: 116.6, color: '#F59E0B', icon: 'gem', withdrawalDay: 1 },
  ]);
  const [paymentMethods, setPaymentMethods] = useState({
    mpesa: t('waiting'),
    emola: t('waiting'),
    paypal: t('waiting')
  });

  const isUserAdmin = user?.phone === '+55 21 98124-5002';
  const maintenanceActive = !isUserAdmin && appStatus.status !== 'OPEN';

  // Global Socket Listeners (only mount once)
  useEffect(() => {
    const onConnect = () => {
      console.log("[CLIENT] Socket connected:", socket.id);
      setIsSocketConnected(true);
      socket.emit('get_app_status');
    };
    const onDisconnect = (reason: string) => {
      console.warn("[CLIENT] Socket disconnected:", reason);
      setIsSocketConnected(false);
    };
    const onConnectError = (error: any) => {
      console.error("[CLIENT] Socket connection error:", error);
      setIsSocketConnected(false);
      // Give a bit more info if it's a known string error
      const errorMsg = error?.message || String(error);
      if (errorMsg === 'server error') {
        console.warn("Server side error detected. Retrying...");
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    socket.on('app_status_update', (data) => {
      setAppStatus(data);
    });

    socket.on('welcome_settings_update', (settings) => {
      setAppStatus(prev => ({ ...prev, welcomeSettings: settings }));
    });

    socket.on('prizes_update', (data) => {
      setPrizes(data);
    });

    socket.on('payment_methods_update', (data) => {
      setPaymentMethods(data);
    });

    socket.on('vip_plans_update', (data) => {
      setVipPlans(data);
    });

    socket.on('funds_update', (data) => {
      setFunds(data);
    });

    socket.on('challenge_response', (res) => {
      if (res.success) {
        alert(t('daily_bonus_success', { reward: res.reward }));
      } else {
        alert(res.message);
      }
    });

    socket.on('login_response', (res) => {
      console.log("[CLIENT] Received login response:", res);
      setIsAuthLoading(false);
      if (res.success) {
        setUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('moza_user', JSON.stringify(res.user));
        setAuthError(null);
        if (appStatus.welcomeSettings?.active) {
          setShowWelcome(true);
        }
      } else {
        setAuthError(res.message);
      }
    });

    socket.on('registration_response', (res) => {
      console.log("[CLIENT] Received registration response:", res);
      setIsAuthLoading(false);
      if (res.success) {
        alert(t('welcome_msg'));
        setIsRegisterMode(false);
        setAuthError(null);
      } else {
        setAuthError(res.message);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
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

  // Load user from local storage and validate with database
  useEffect(() => {
    const savedUser = localStorage.getItem('moza_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Ensure Firebase auth session
        if (!auth.currentUser) {
          signInAnonymously(auth).catch(err => console.error("Firebase auto-auth failed:", err));
        }

        // Sync with backend immediately to get latest balance/level
        if (isSocketConnected) {
          socket.emit('validate_session', { phone: parsedUser.phone });
        }
      } catch (e) {
        localStorage.removeItem('moza_user');
      }
    }
  }, [isSocketConnected]);

  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async () => {
    setAuthError(null);
    const isSpecialAdmin = authForm.phone.toLowerCase() === 'admin';
    const sanitizedPhone = isSpecialAdmin ? 'admin' : authForm.phone.replace(/\D/g, '');
    
    if (!isSpecialAdmin && (sanitizedPhone.length < 3)) {
      triggerShake();
      return setAuthError(t('auth_error_phone'));
    }
    if (authForm.pass.length < 4) {
      triggerShake();
      return setAuthError(t('auth_error_pass'));
    }
    
    setIsAuthLoading(true);

    try {
      const response = await (isRegisterMode 
        ? fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              phone: sanitizedPhone, 
              password: authForm.pass, 
              inviteCode: authForm.invite,
              name: `Investidor ${sanitizedPhone.slice(-3)}`
            })
          })
        : fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              phone: sanitizedPhone, 
              password: authForm.pass 
            })
          })
      );

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
           const errRes = await response.json();
           setIsAuthLoading(false);
           triggerShake();
           return setAuthError(errRes.message || "Falha na autenticação.");
        } else {
           const text = await response.text();
           console.error("Non-JSON Error:", text);
           setIsAuthLoading(false);
           triggerShake();
           return setAuthError(`Erro do servidor (${response.status}). Reinicie a aplicação.`);
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida (Não é JSON). Verifique sua rede.");
      }

      const res = await response.json();
      setIsAuthLoading(false);

      if (res.success) {
        if (isRegisterMode) {
          alert(t('welcome_msg'));
          setIsRegisterMode(false);
          setAuthError(null);
        } else {
          completeLogin(res.user);
        }
      } else {
        setAuthError(res.message);
        triggerShake();
      }
    } catch (err: any) {
      setIsAuthLoading(false);
      triggerShake();
      console.error("Auth Exception:", err);
      const msg = err?.message || String(err);
      setAuthError(`Erro de ligação: ${msg}`);
    }
  };

  const completeLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('moza_user', JSON.stringify(userData));
    setAuthError(null);
    
    // Sign in anonymously to Firebase to allow Firestore access
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(err => console.error("Firebase auth failed:", err));
    }

    if (appStatus.welcomeSettings?.active) {
      setShowWelcome(true);
    }
    if (!socket.connected) socket.connect();
  };

  const activateVIP = (plan: VIPPlan) => {
    if (!user) return;
    if (user.level === plan.name) return alert(t('vip_already_active'));
    
    setActivatingPlan(plan);
    setShowPayment(true);
  };

  useEffect(() => {
    socket.on('vip_activated', (res) => {
      if (res.success) {
        setActivatedPlanName(res.planName || 'VIP');
        setShowSuccess(true);
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
    auth.signOut(); // Sign out of Firebase as well
    setIsAdminView(false);
    setActiveTab('home');
    setAuthForm({ phone: '', pass: '', invite: '' });
  };

  const handlePaymentConfirm = (file: File | null, amount: number, type?: 'PAYMENT' | 'VIP_UPGRADE') => {
    if (file && user) {
      if (amount <= 0) return alert(t('valid_amount'));
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
        alert(t('activation_sent', { plan: activatingPlan?.name || 'VIP' }));
      } else {
        alert(t('payment_received'));
      }
      
      setShowPayment(false);
      setActivatingPlan(null);
    } else {
      alert(t('select_proof'));
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
      alert(t('win_msg', { amount: win }));
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
                    <Headset size={10} /> SUPORTE EXCLUSIVO: MOZ INV. disponível via WhatsApp 24/7 para membros VIP. 
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
                <small className="text-text-secondary font-bold uppercase tracking-[1.5px] text-[10px]">{t('available_balance')}</small>
                <div className="text-3xl font-serif text-accent">
                  MZN {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right space-y-1">
                <small className="text-text-secondary font-bold uppercase tracking-[1.5px] text-[10px]">{t('vip_class')}</small>
                <div className="text-white font-bold italic font-serif">{user?.level}</div>
              </div>
            </div>

            {/* QUICK STATS / "AND MUCH MORE" */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-surface border border-border p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                     <TrendingUp size={14} className="text-emerald-400" />
                     <small className="text-[8px] uppercase font-black tracking-widest text-text-secondary">{t('growth_24h')}</small>
                  </div>
                  <b className="text-white text-lg font-serif">+12.4%</b>
               </div>
               <div className="bg-surface border border-border p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                     <ShieldCheck size={14} className="text-blue-400" />
                     <small className="text-[8px] uppercase font-black tracking-widest text-text-secondary">{t('security')}</small>
                  </div>
                  <b className="text-white text-lg font-serif">SSL 256</b>
               </div>
            </div>

            {/* DAILY CHALLENGE BANNER */}
            <div className="bg-linear-to-r from-accent to-accent-muted p-6 rounded-3xl mb-8 relative overflow-hidden group border border-white/10 shadow-lg">
               <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Gift size={100} />
               </div>
               <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h4 className="text-bg font-black italic text-lg leading-tight">{t('daily_challenge')}</h4>
                    <p className="text-bg/60 text-[9px] uppercase font-bold tracking-[2px] mt-1">{t('daily_challenge_desc')}</p>
                  </div>
                  <button 
                    onClick={() => socket.emit('claim_daily_challenge', { phone: user?.phone })}
                    className="bg-bg text-accent font-black px-6 py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-white transition-colors active:scale-95"
                  >
                    {t('claim')}
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { id: 'recharge', label: t('recharge'), Icon: CircleDollarSign, color: 'text-accent', bg: 'bg-accent-muted', action: () => setShowPayment(true) },
                { id: 'withdraw', label: t('withdraw'), Icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('withdraw') },
                { id: 'loan', label: t('loan'), Icon: Landmark, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('loan') },
                { id: 'team', label: t('team'), Icon: Users, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('team') },
                { id: 'tutorial', label: t('tutorial'), Icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', action: () => setActiveTab('tasks') },
                { id: 'fund', label: t('fund'), Icon: TrendingUp, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('fund') },
                { id: 'task', label: t('tasks'), Icon: FileText, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('tasks') },
                { id: 'company', label: t('company'), Icon: Building2, color: 'text-accent', bg: 'bg-accent-muted', action: () => setActiveTab('company') },
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
              <h3 className="text-white font-serif italic text-xl">{t('capital_plans')}</h3>
              <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
            </div>

            <div className="space-y-4">
              {vipPlans.map((plan) => (
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
        return <InvestmentsView user={user} isMaintenance={maintenanceActive} vipPlans={vipPlans} />;
      case 'vip':
        return <VIPView user={user} onActivate={activateVIP} vipPlans={vipPlans} />;
      case 'team':
        return <TeamView user={user} />;
      case 'withdraw':
        return <WithdrawView user={user} onBack={() => setActiveTab('home')} isMaintenance={maintenanceActive} vipPlans={vipPlans} />;
      case 'fund':
        return <FundView user={user} funds={funds} />;
      case 'company':
        return <CompanyView paymentMethods={paymentMethods} />;
      case 'support':
        return <SupportView onNavigate={setActiveTab} paymentMethods={paymentMethods} />;
      case 'chat':
        return <CommunityChatView user={user} onBack={() => setActiveTab('support')} />;
      case 'mines':
        return <MinesGame user={user} onBack={() => setActiveTab('home')} onUpdateUser={setUser} />;
      case 'reports':
        return <ProfitReportsView onBack={() => setActiveTab('me')} />;
      case 'history':
        return <WithdrawalHistoryView onBack={() => setActiveTab('me')} />;
      case 'loan':
        return <LoanView user={user} onBack={() => setActiveTab('home')} />;
      case 'security':
        return <SecurityView onBack={() => setActiveTab('me')} />;
      case 'settings':
        return <SettingsView onBack={() => setActiveTab('me')} />;
      case 'me':
        return <ProfileView user={user} onLogout={logout} onWithdraw={() => setActiveTab('withdraw')} onNavigate={setActiveTab} onAdmin={() => setIsAdminView(true)} />;
      default:
        return null;
    }
  };

  // Maintenance Check (Global Lock)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <Logo size="lg" className="mb-8 animate-pulse" />
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-accent animate-progress w-full"></div>
        </div>
        <p className="mt-4 text-[8px] uppercase tracking-[3px] text-accent font-bold animate-pulse">Sincronizando Sistema de Elite...</p>
      </div>
    );
  }

  if (!isAdminView && !isUserAdmin && (appStatus.status === 'MAINTENANCE' || appStatus.status === 'CLOSED')) {
     return (
       <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/20 animate-pulse">
            <Lock className="text-accent" size={40} />
         </div>
         <h1 className="text-2xl font-serif text-white mb-2 italic">{t('restricted_access')}</h1>
         <p className="text-text-secondary text-sm max-w-xs mb-8 leading-relaxed">
           {appStatus.message || t('maintenance_msg_default')}
         </p>
         <div className="p-4 bg-surface rounded-xl border border-border w-full max-w-sm mb-12">
            <p className="text-[10px] text-accent uppercase tracking-widest font-bold mb-1">{t('system_status')}</p>
            <p className="text-white font-medium text-xs">
              {appStatus.status === 'MAINTENANCE' ? t('maintenance_active') : t('suspension_active')}
            </p>
         </div>
         
         <div className="space-y-4 w-full max-w-xs">
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-accent transition-colors"
            >
              {t('i_am_admin')}
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
                      setShowWelcome(true);
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
      <div className="flex flex-col min-h-screen bg-bg overflow-hidden relative font-sans">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="w-full bg-red-600 text-white text-[9px] font-black uppercase tracking-[2px] py-2 text-center animate-pulse z-[100] fixed top-0 left-0">
             Sem conexão à internet. Verifique os seus dados.
          </div>
        )}
        
        <div className={`flex-1 flex items-center justify-center p-6 ${!isOnline ? 'pt-12' : ''}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isShaking ? { 
              opacity: 1, 
              scale: 1,
              x: [-6, 6, -6, 6, 0] 
            } : { 
              opacity: 1, 
              scale: 1,
              x: 0
            }}
            transition={{ 
              x: { duration: 0.4 },
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 }
            }}
            className="bg-surface p-10 rounded-3xl w-full max-w-sm border border-border text-center shadow-2xl relative overflow-hidden"
          >
            {/* Accent glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <Logo size="lg" className="mb-4" />
            <div className="mb-10">
              <h2 className="text-white font-serif italic text-xl">
                A sua elite financeira
              </h2>
              <p className="text-[9px] uppercase tracking-[2px] text-text-secondary mt-1">
                Aceda ao seu painel de rendimentos
              </p>
            </div>
            
            <div className="space-y-5">
              <div className="relative group">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={16} />
                <div className="flex bg-bg border border-border rounded-lg overflow-hidden focus-within:border-accent transition-all pl-10">
                  <div className="bg-white/5 px-2 flex items-center border-r border-border text-text-secondary text-[10px] font-black tracking-tighter">
                    +258
                  </div>
                  <input 
                    type="tel" 
                    placeholder="84 123 4567"
                    className="w-full bg-transparent py-3 px-4 text-white outline-none text-sm placeholder:opacity-30"
                   value={authForm.phone || ''}
                    onChange={(e) => {
                      setAuthForm({ ...authForm, phone: e.target.value });
                      if(authError) setAuthError(null);
                    }}
                  />
                </div>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t('password')}
                  className="w-full bg-bg border border-border py-3 pl-10 pr-12 rounded-lg text-white outline-none focus:border-accent transition-colors text-sm"
                  value={authForm.pass || ''}
                  onChange={(e) => {
                    setAuthForm({ ...authForm, pass: e.target.value });
                    if(authError) setAuthError(null);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {isRegisterMode && (
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input 
                    type="text" 
                    placeholder={t('invite_code')}
                    className="w-full bg-bg border border-border py-3 pl-10 pr-4 rounded-lg text-white outline-none focus:border-accent transition-colors text-sm"
                    value={authForm.invite || ''}
                    onChange={(e) => {
                      setAuthForm({ ...authForm, invite: e.target.value });
                      if(authError) setAuthError(null);
                    }}
                  />
                </div>
              )}

              {!isRegisterMode && (
                <div className="flex items-center justify-between px-1">
                  <button className="text-[9px] text-accent font-black uppercase tracking-widest hover:underline">
                      {t('forgot_password')}
                  </button>
                </div>
              )}

              <AnimatePresence>
                {(authError || successMsg) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`${authError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} border rounded-lg p-3 text-[10px] flex items-center gap-2`}
                  >
                    {authError ? <AlertCircle size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
                    <span className="text-left font-medium uppercase tracking-wider">{authError || successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleAuth}
                disabled={isAuthLoading || !isOnline}
                className={`w-full bg-linear-to-r from-blue-950 to-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 hover:opacity-95 active:scale-95 transition-all mt-6 uppercase tracking-[3px] text-[10px] flex items-center justify-center gap-3 ${(isAuthLoading || !isOnline) ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isAuthLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>A PROCESSAR...</span>
                  </>
                ) : (
                  !isOnline 
                    ? 'INTERNET NECESSÁRIA' 
                    : (isRegisterMode ? t('register').toUpperCase() : t('login').toUpperCase())
                )}
              </button>

              <p className="text-[10px] uppercase tracking-wider text-text-secondary mt-8 font-bold">
                {isRegisterMode ? 'Já possui acesso? ' : 'Não possui acesso? '}
                <button 
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-accent font-black hover:underline"
                >
                  {isRegisterMode ? t('login') : t('register')}
                </button>
              </p>

              <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[7px] text-emerald-500 uppercase font-black tracking-widest">Protocolo Seguro SSL Ativo</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24 font-sans text-white relative">
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
          paymentMethods={paymentMethods}
        />
      )}

      {/* Bottom Nav */}
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Support Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('support')}
        className="fixed right-6 bottom-32 w-14 h-14 bg-accent text-bg rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(255,184,0,0.3)] z-50 animate-bounce-slow"
      >
        <Headset size={28} />
      </motion.button>

      {/* Success Celebration Overlay */}
      <SuccessCelebration 
        isVisible={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        planName={activatedPlanName} 
      />

      {/* Welcome Modal */}
      <WelcomeModal 
        isVisible={showWelcome}
        onClose={() => setShowWelcome(false)}
        user={user}
        settings={appStatus.welcomeSettings}
      />
    </div>
  );
}
