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
    closureMessage: 'A plataforma está temporariamente em manutenção. Voltaremos em breve!'
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

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Strict Login Check
    socket.on("login_request", ({ phone, password }) => {
      const user = state.registeredUsers.find(u => u.phone === phone);
      if (user && user.password === password) {
        // Return user without password for safety
        const { password: _, ...safeUser } = user;
        socket.emit("login_response", { success: true, user: safeUser });
      } else if (user) {
        socket.emit("login_response", { success: false, message: "Palavra-passe incorrecta." });
      } else {
        socket.emit("login_response", { success: false, message: "Número não registado. Contacte o Administrador." });
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
    });

    socket.on("activate_vip", ({ phone, planId }) => {
      const user = state.registeredUsers.find(u => u.phone === phone);
      const plan = SERVER_VIP_PLANS.find(p => p.id === planId);

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
        user: safeUser
      });

      console.log(`[SERVER] ${phone} upgraded to ${plan.name}`);
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
            // Balance is NOT deducted here since they are paying OUTSIDE the system usually, 
            // but if the modal allows them to send proof for a price they paid, 
            // we just upgrade the level.
            console.log(`[ADMIN] Upgraded ${user.phone} to ${user.level} via approval.`);
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
