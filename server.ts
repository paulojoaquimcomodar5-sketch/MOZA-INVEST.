import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // State for Admin oversight
  const DB_FILE = path.join(__dirname, 'db.json');

  let state = {
    messages: [
      { id: '1', user: 'Admin', text: 'Bem-vindos à Família MOZA INV! Como posso ajudar hoje?', time: '09:00', isAdmin: true },
      { id: '2', user: 'M. Carlos', text: 'Bom dia grupo! Alguém já recebeu o rendimento VIP 2?', time: '09:15', isAdmin: false },
    ],
    banners: [
      { id: '1', text: 'MOZA INVESTIMENTOS LUXURY', sub: 'O seu capital, o nosso prestígio.', color: 'linear-gradient(135deg, #1e293b, #0f172a)', textColor: '#e3b341', imageUrl: 'https://picsum.photos/seed/luxury/1200/600' },
      { id: '2', text: 'OPORTUNIDADE VIP 3', sub: 'Ative hoje e ganhe 15% de bónus imediato.', color: 'linear-gradient(135deg, #14161a, #2d3748)', textColor: '#e3b341', imageUrl: 'https://picsum.photos/seed/gold/1200/600' },
    ],
    pendingWithdrawals: [] as any[],
    pendingApprovals: [] as any[],
    registeredUsers: [
      { phone: '+55 21 98124-5002', name: 'ADMINISTRADOR', balance: 1000000, fundBalance: 0, totalProfit: 0, level: 'VIP 4', password: 'admin', inviteCode: 'ADMIN' },
      { phone: '123', name: 'Teste User', balance: 500, fundBalance: 0, totalProfit: 0, level: 'Membro Grátis', password: '123', inviteCode: 'MOZA2026' }
    ] as any[],
    validInviteCode: "MOZA2026",
    appStatus: 'OPEN' as 'OPEN' | 'MAINTENANCE' | 'CLOSED' | 'RESTRICTED',
    closureMessage: 'A plataforma está temporariamente em manutenção. Voltaremos em breve!',
    paymentMethods: {
      mpesa: "858778905 (PAULO JOAQUIM COMODALI)",
      emola: "875376446 (LUISA ZULANE MALUMBE)",
      paypal: "paulichocomedy@gmail.com"
    },
    prizes: [
      { id: '1', name: 'Motorizada 150cc', image: 'https://picsum.photos/seed/motorcycle/1200/800', desc: 'Mota zero km para facilitar a sua mobilidade.' },
      { id: '2', name: 'Smart TV 55" 4K', image: 'https://picsum.photos/seed/television/1200/800', desc: 'Experiência de cinema no conforto da sua sala.' },
      { id: '3', name: 'iPhone 17 Pro', image: 'https://picsum.photos/seed/iphone/1200/800', desc: 'O smartphone mais avançado do mundo (Lançamento Exclusivo).' },
      { id: '4', name: 'BMW X5 LUX', image: 'https://picsum.photos/seed/bmw/1200/800', desc: 'O máximo em luxo, potência e sofisticação alemã.' },
      { id: '5', name: 'RACTS Premium', image: 'https://picsum.photos/seed/gold/1200/800', desc: 'Pacotes especiais de alocação e benefícios exclusivos.' },
    ],
    vipPlans: [
      { id: '1', name: 'VIP 1', price: 500, daily: 36, tasks: 5, color: '#D4AF37', icon: 'zap' },
      { id: '2', name: 'VIP 2', price: 2000, daily: 154, tasks: 10, color: '#4A90E2', icon: 'diamond' },
      { id: '3', name: 'VIP 3', price: 6000, daily: 480, tasks: 15, color: '#10B981', icon: 'crown' },
      { id: '4', name: 'VIP 4', price: 15000, daily: 1250, tasks: 20, color: '#8B5CF6', icon: 'flame' },
    ],
    funds: [
      { id: 'f1', name: 'Fundo Imobiliário Lux', rate: 1.8, min: 500, period: '7 Dias', risk: 'Baixo', desc: 'Investimentos em imóveis comerciais de alto padrão em Maputo.' },
      { id: 'f2', name: 'Index Gold Moçambique', rate: 3.5, min: 2000, period: '30 Dias', risk: 'Médio', desc: 'Ativos lastreados no desempenho de commodities e metais preciosos.' },
      { id: 'f3', name: 'Tech Growth Fund', rate: 5.2, min: 10000, period: '90 Dias', risk: 'Alto', desc: 'Aceleração de Softwares e infraestrutura digital 5G.' },
    ]
  };

  // Load state from file
  if (fs.existsSync(DB_FILE)) {
    try {
      const savedState = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      state = { ...state, ...savedState };
      
      // Migration: Ensure level and tickets exist for old users
      state.registeredUsers.forEach(u => {
        if (u.level === undefined) u.level = 'Membro Grátis';
        if (u.tickets === undefined) u.tickets = 0;
      });

      if (state.appStatus === undefined) state.appStatus = 'OPEN';
      if (state.closureMessage === undefined) state.closureMessage = 'A plataforma está temporariamente em manutenção. Voltaremos em breve!';
      if (state.paymentMethods === undefined) {
        state.paymentMethods = {
          mpesa: "858778905 (PAULO JOAQUIM COMODALI)",
          emola: "875376446 (LUISA ZULANE MALUMBE)",
          paypal: "paulichocomedy@gmail.com"
        };
      }
      if (state.prizes === undefined) {
        state.prizes = [
          { id: '1', name: 'Motorizada 150cc', image: 'https://picsum.photos/seed/motorcycle/1200/800', desc: 'Mota zero km para facilitar a sua mobilidade.' },
          { id: '2', name: 'Smart TV 55" 4K', image: 'https://picsum.photos/seed/television/1200/800', desc: 'Experiência de cinema no conforto da sua sala.' },
          { id: '3', name: 'iPhone 17 Pro', image: 'https://picsum.photos/seed/iphone/1200/800', desc: 'O smartphone mais avançado do mundo (Lançamento Exclusivo).' },
          { id: '4', name: 'BMW X5 LUX', image: 'https://picsum.photos/seed/bmw/1200/800', desc: 'O máximo em luxo, potência e sofisticação alemã.' },
          { id: '5', name: 'RACTS Premium', image: 'https://picsum.photos/seed/gold/1200/800', desc: 'Pacotes especiais de alocação e benefícios exclusivos.' },
        ];
      }
      if (state.vipPlans === undefined) {
        state.vipPlans = [
          { id: '1', name: 'VIP 1', price: 500, daily: 36, tasks: 5, color: '#D4AF37', icon: 'zap' },
          { id: '2', name: 'VIP 2', price: 2000, daily: 154, tasks: 10, color: '#4A90E2', icon: 'diamond' },
          { id: '3', name: 'VIP 3', price: 6000, daily: 480, tasks: 15, color: '#10B981', icon: 'crown' },
          { id: '4', name: 'VIP 4', price: 15000, daily: 1250, tasks: 20, color: '#8B5CF6', icon: 'flame' },
        ];
      }
      if (state.funds === undefined) {
        state.funds = [
          { id: 'f1', name: 'Fundo Imobiliário Lux', rate: 1.8, min: 500, period: '7 Dias', risk: 'Baixo', desc: 'Investimentos em imóveis comerciais de alto padrão em Maputo.' },
          { id: 'f2', name: 'Index Gold Moçambique', rate: 3.5, min: 2000, period: '30 Dias', risk: 'Médio', desc: 'Ativos lastreados no desempenho de commodities e metais preciosos.' },
          { id: 'f3', name: 'Tech Growth Fund', rate: 5.2, min: 10000, period: '90 Dias', risk: 'Alto', desc: 'Aceleração de Softwares e infraestrutura digital 5G.' },
        ];
      }

      console.log("[SERVER] Database loaded successfully.");
    } catch (e) {
      console.error("[SERVER] Error loading database:", e);
    }
  }

  const saveState = () => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
      console.error("[SERVER] Error saving database:", e);
    }
  };

  const SERVER_VIP_PLANS = [
    { id: 1, name: 'VIP 1', price: 700 },
    { id: 2, name: 'VIP 2', price: 4000 },
    { id: 3, name: 'VIP 3', price: 12000 },
    { id: 4, name: 'VIP 4', price: 35000 },
  ];

  app.get("/health", (req, res) => {
    res.json({ 
      status: "running", 
      socketConnected: io.engine.clientsCount,
      timestamp: new Date().toISOString() 
    });
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("ping", () => socket.emit("pong"));

    // Session Validation (Full Stack Sync)
    socket.on("validate_session", ({ phone }) => {
      const user = state.registeredUsers.find(u => u.phone === phone);
      if (user) {
        const { password: _, ...safeUser } = user;
        socket.emit("user_data_updated", safeUser);
        console.log(`[AUTH] Session validated for ${phone}`);
      }
    });

    // Strict Login Check
    socket.on("login_request", ({ phone, password }) => {
      try {
        console.log(`[AUTH] Login attempt for: "${phone}"`);
        
        // Flexible Phone Matching (ignore spaces and dashes)
        const normalize = (p: string) => p.replace(/[\s\-\+\(\)]/g, '');
        const targetPhone = normalize(phone);
        
        const user = state.registeredUsers.find(u => {
          const up = normalize(u.phone || '');
          return up === targetPhone || u.phone === phone;
        });

        if (user && user.password === password) {
          console.log(`[AUTH] Login success: ${phone}`);
          (socket as any).userPhone = user.phone;
          const { password: _, ...safeUser } = user;
          socket.emit("login_response", { success: true, user: safeUser });
        } else if (user) {
          console.warn(`[AUTH] Login failed: Wrong password for ${phone}`);
          socket.emit("login_response", { success: false, message: "Palavra-passe incorrecta." });
        } else {
          // Special fallback for admin if for some reason the DB is cleared/corrupted
          if ((phone.toLowerCase() === 'admin' || targetPhone === '5521981245002') && password === 'admin') {
             const fallbackAdmin = state.registeredUsers.find(u => normalize(u.phone) === '5521981245002') || state.registeredUsers[0];
             console.log("[AUTH] Using Admin Fallback");
             socket.emit("login_response", { success: true, user: fallbackAdmin });
             return;
          }
          console.warn(`[AUTH] Login failed: User not found ${phone}`);
          socket.emit("login_response", { success: false, message: "Número não registado. Contacte o Administrador." });
        }
      } catch (err) {
        console.error("[SERVER] Login processing error:", err);
        socket.emit("login_response", { success: false, message: "Erro interno no servidor ao processar o login." });
      }
    });

    socket.on("register_user", (userData) => {
      if (userData.inviteCode !== state.validInviteCode) {
        socket.emit("registration_response", { success: false, message: "Código de Convite inválido!" });
        return;
      }

      if (!state.registeredUsers.find(u => u.phone === userData.phone)) {
        const newUser = { 
          phone: userData.phone, 
          name: 'User-' + userData.phone.slice(-4), 
          password: userData.password,
          inviteCode: userData.inviteCode || 'MOZA2026',
          balance: 0, 
          fundBalance: 0, 
          totalProfit: 0,
          level: 'Membro Grátis'
        };
        state.registeredUsers.push(newUser);
        saveState();
        
        // Attach phone to socket for targeted emits
        (socket as any).userPhone = userData.phone;

        // Auto-login after registration
        const { password: _, ...safeUser } = newUser;
        socket.emit("registration_response", { success: true });
        socket.emit("login_response", { success: true, user: safeUser });
      } else {
        socket.emit("registration_response", { success: false, message: "Número já existe." });
      }
    });

    // Approval Flow
    socket.on("submit_for_approval", (item) => {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...item,
        status: 'PENDING',
        time: new Date().toISOString()
      };
      state.pendingApprovals.push(newItem);
      saveState();
      io.emit("new_approval_needed", newItem); // Alert Admins
      socket.emit("submission_received", { success: true, id: newItem.id });
    });

    socket.on("get_pending_approvals", () => {
      socket.emit("approvals_list", state.pendingApprovals.filter(a => a.status === 'PENDING'));
    });

    socket.on("get_all_users", () => {
      // Return safe user list
      const safeUsers = state.registeredUsers.map(({ password: _, ...u }) => u);
      socket.emit("users_list", safeUsers);
    });

    socket.on("get_system_stats", () => {
      const stats = {
        totalUsers: state.registeredUsers.length,
        totalBalance: state.registeredUsers.reduce((sum: number, u: any) => sum + u.balance, 0),
        pendingApprovals: state.pendingApprovals.filter(a => a.status === 'PENDING').length,
        pendingWithdrawals: state.pendingWithdrawals.filter(w => w.status === 'PENDING').length,
        activeBanners: state.banners.length,
        currentInviteCode: state.validInviteCode
      };
      socket.emit("system_stats", stats);
    });

    socket.on("update_invite_code", (newCode) => {
      state.validInviteCode = newCode;
      saveState();
      io.emit("new_message", { 
        id: 'sys-' + Date.now(), 
        user: 'SISTEMA', 
        text: `🔐 Código de Convite atualizado para maior segurança.`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isAdmin: true 
      });
      // Refresh stats for all admins
      const stats = {
        totalUsers: state.registeredUsers.length,
        totalBalance: state.registeredUsers.reduce((sum: number, u: any) => sum + u.balance, 0),
        pendingApprovals: state.pendingApprovals.filter(a => a.status === 'PENDING').length,
        pendingWithdrawals: state.pendingWithdrawals.filter(w => w.status === 'PENDING').length,
        activeBanners: state.banners.length,
        currentInviteCode: state.validInviteCode
      };
      io.emit("system_stats", stats);
    });

    socket.on("get_banners", () => {
      socket.emit("banners_list", state.banners);
    });

    socket.on("update_user_balance", ({ phone, amount }) => {
      const u = state.registeredUsers.find(x => x.phone === phone);
      if (u) {
        u.balance += amount;
        saveState();
        console.log(`[SERVER] User ${phone} balance updated by ${amount}. New balance: ${u.balance}`);
        // Send back to client to update state
        socket.emit("user_data_updated", u);
      }
    });

    socket.on("manual_user_update", ({ phone, updates }) => {
      const index = state.registeredUsers.findIndex(u => u.phone === phone);
      if (index !== -1) {
        state.registeredUsers[index] = { ...state.registeredUsers[index], ...updates };
        saveState();
        const updatedUser = state.registeredUsers[index];
        // Notify the specific user if they are online (simple broadcast for this applet)
        io.emit("user_data_updated", updatedUser);
        // Refresh admin list
        const safeUsers = state.registeredUsers.map(({ password: _, ...u }) => u);
        io.emit("users_list", safeUsers);
        console.log(`[ADMIN] Manual update for ${phone}:`, updates);
      }
    });

    socket.on("add_banner", (data) => {
      const newBanner = {
        id: Math.random().toString(36).substr(2, 9),
        ...data
      };
      state.banners.push(newBanner);
      saveState();
      io.emit("banners_list", state.banners);
      io.emit("new_message", { 
        id: 'b-' + newBanner.id, 
        user: 'SISTEMA', 
        text: `📢 NOVIDADE: ${newBanner.text}`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isAdmin: true 
      });
    });

    socket.on("remove_banner", (id) => {
      state.banners = state.banners.filter(b => b.id !== id);
      saveState();
      io.emit("banners_list", state.banners);
    });

    socket.on("set_app_status", (status: 'OPEN' | 'MAINTENANCE' | 'CLOSED' | 'RESTRICTED') => {
      state.appStatus = status;
      saveState();
      io.emit("app_status_update", { status: state.appStatus, message: state.closureMessage });
      console.log(`[ADMIN] APP STATUS CHANGED TO: ${status}`);
    });

    socket.on("update_closure_message", (msg: string) => {
      state.closureMessage = msg;
      saveState();
      io.emit("app_status_update", { status: state.appStatus, message: state.closureMessage });
    });

    socket.on("get_app_status", () => {
      socket.emit("app_status_update", { status: state.appStatus, message: state.closureMessage });
      socket.emit("prizes_update", state.prizes);
      socket.emit("payment_methods_update", state.paymentMethods);
      socket.emit("vip_plans_update", state.vipPlans);
      socket.emit("funds_update", state.funds);
    });

    socket.on("update_vip_plans", (plans) => {
      state.vipPlans = plans;
      saveState();
      io.emit("vip_plans_update", state.vipPlans);
    });

    socket.on("update_payment_methods", (methods) => {
      state.paymentMethods = methods;
      saveState();
      io.emit("payment_methods_update", state.paymentMethods);
    });

    socket.on("update_prizes", (newPrizes) => {
      state.prizes = newPrizes;
      saveState();
      io.emit("prizes_update", state.prizes);
    });

    socket.on("activate_vip", ({ phone, planId }) => {
      const user = state.registeredUsers.find(u => u.phone === phone);
      const plan = state.vipPlans.find(p => p.id === planId);

      if (!user) return socket.emit("vip_activated", { success: false, message: "Utilizador não encontrado." });
      if (!plan) return socket.emit("vip_activated", { success: false, message: "Plano inválido." });
      if (user.balance < plan.price) return socket.emit("vip_activated", { success: false, message: "Saldo insuficiente." });

      // Process activation
      user.balance -= plan.price;
      user.level = plan.name;
      saveState();

      const { password: _, ...safeUser } = user;
      socket.emit("vip_activated", { 
        success: true, 
        message: `${plan.name} ativado com sucesso!`,
        planName: plan.name,
        user: safeUser
      });

      console.log(`[SERVER] ${phone} upgraded to ${plan.name}`);
    });

    socket.on("subscribe_fund", ({ phone, fundId, amount }) => {
      const user = state.registeredUsers.find(u => u.phone === phone);
      const fund = state.funds.find(f => f.id === fundId);
      if (user && fund) {
        if (user.balance >= amount) {
          user.balance -= amount;
          user.fundBalance = (user.fundBalance || 0) + amount;
          saveState();
          
          const { password: _, ...safeUser } = user;
          socket.emit("user_data_updated", safeUser);
          socket.emit("fund_subscription_response", { success: true });

          // Submit for admin review
          const approvalId = Math.random().toString(36).substr(2, 9);
          state.pendingApprovals.push({
            id: approvalId,
            type: 'FUND_SUBSCRIBE',
            phone: user.phone,
            name: user.name,
            fundName: fund.name,
            amount: amount,
            status: 'PENDING',
            time: new Date().toISOString()
          });
          saveState();
          io.emit("new_approval_needed", { id: approvalId, phone: user.phone, type: 'Investimento em Fundo' });
        } else {
          socket.emit("fund_subscription_response", { success: false, message: "Saldo insuficiente." });
        }
      }
    });

    socket.on("get_pending_withdrawals", () => {
      socket.emit("withdrawals_list", state.pendingWithdrawals.filter(w => w.status === 'PENDING'));
    });

    socket.on("approve_withdrawal", (id) => {
      const w = state.pendingWithdrawals.find(x => x.id === id);
      if (w) {
        w.status = 'APPROVED';
        // Deduct balance on approval
        const user = state.registeredUsers.find(u => u.phone === w.phone);
        if (user) {
          user.balance -= w.amount;
          saveState();
          io.emit("withdrawal_status_updated", { ...w, updatedUser: user });
        } else {
          saveState();
          io.emit("withdrawal_status_updated", w);
        }
      }
    });

    socket.on("reject_withdrawal", (id) => {
      const w = state.pendingWithdrawals.find(x => x.id === id);
      if (w) {
        w.status = 'REJECTED';
        saveState();
        io.emit("withdrawal_status_updated", w);
      }
    });

    socket.on("approve_item", (id) => {
      const item = state.pendingApprovals.find(a => a.id === id);
      if (item) {
        item.status = 'APPROVED';
        
        // Update user balance/stats based on type
        const user = state.registeredUsers.find(u => u.phone === item.user);
        if (user) {
          if (item.type === 'PAYMENT') {
            user.balance += item.data.amount || 0;
            user.fundBalance += item.data.amount || 0;
          } else if (item.type === 'LOTTERY') {
            user.balance += item.data.amount || 0;
            user.totalProfit += item.data.amount || 0;
          } else if (item.type === 'VIP_UPGRADE') {
            user.level = item.data.planName || user.level;
            console.log(`[ADMIN] Upgraded ${user.phone} to ${user.level} via approval.`);
            // Inform the specific user so they see the animation
            const targetSocketId = [...io.sockets.sockets.values()].find(s => (s as any).userPhone === user.phone)?.id;
            if (targetSocketId) {
              io.to(targetSocketId).emit("vip_activated", {
                success: true,
                message: `${user.level} ativado com sucesso!`,
                planName: user.level,
                user: { phone: user.phone, balance: user.balance, level: user.level }
              });
            }
          }
          
          saveState();
          io.emit("item_status_updated", { ...item, updatedUser: user });
          console.log(`[ADMIN] Approved ${item.type} for ${item.user}. Balance: ${user.balance}`);
        } else {
          saveState();
          io.emit("item_status_updated", item);
        }
      }
    });

    socket.on("reject_item", (id) => {
      const item = state.pendingApprovals.find(a => a.id === id);
      if (item) {
        item.status = 'REJECTED';
        saveState();
        io.emit("item_status_updated", item);
        console.log(`[ADMIN] Rejected ${item.type} for ${item.user}`);
      }
    });

    // Send existing messages to the new user
    socket.emit("initial_messages", state.messages);

    socket.on("send_message", (data) => {
      // Logic: Only specific numbers or a flag can be Admin
      const isAdmin = data.user === 'ADMIN' || data.phone === '+55 21 98124-5002';
      
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        user: isAdmin ? 'ADMINISTRADOR' : data.user,
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdmin: isAdmin
      };
      state.messages.push(newMessage);
      if (state.messages.length > 50) state.messages.shift();
      saveState();
      io.emit("new_message", newMessage);

      // Auto-reply logic for "Chat Familiar"
      if (!isAdmin) {
        setTimeout(() => {
          const autoReplies = [
            "Olá! Como o ADM Paulo Joaquim pode ajudar?",
            "Processando os resultados... Fique atento aos novos rendimentos!",
            "O Suporte VIP está analisando as novas transações. Já recebeu seu lucro hoje?",
            "Bem-vindo à Família! Continue assistindo e lucrando 🚀",
            "Mantenha-se focado nos seus objetivos VIP. Estamos aqui para ajudar!"
          ];
          const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          
          const adminReply = {
            id: 'auto-' + Math.random().toString(36).substr(2, 9),
            user: 'ADMINISTRADOR',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdmin: true
          };
          
          state.messages.push(adminReply);
          if (state.messages.length > 50) state.messages.shift();
          saveState();
          io.emit("new_message", adminReply);
        }, 2000); // 2 second delay for realism
      }
    });

    socket.on("submit_withdrawal", (data) => {
      const withdrawal = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        requestTime: new Date().toISOString()
      };
      state.pendingWithdrawals.push(withdrawal);
      
      // Notify Admin in chat about new request
      const adminNotice = {
        id: Math.random().toString(36).substr(2, 9),
        user: 'Admin',
        text: `📢 Novo pedido de saque: ${data.amount} MT (${data.channel}). Analisar pedido...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdmin: true
      };
      state.messages.push(adminNotice);
      saveState();
      io.emit("new_message", adminNotice);
      
      socket.emit("withdrawal_received", { status: 'success' });
    });

    socket.on("task_completed", (data) => {
      console.log(`[ADMIN-LOG] User ${data.user} completed task ${data.taskId} for ${data.reward} MT`);
      // Optional: Add to an admin-only message stream or database
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
