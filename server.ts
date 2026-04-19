import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

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
  let messages: { id: string; user: string; text: string; time: string; isAdmin: boolean }[] = [
    { id: '1', user: 'Admin', text: 'Bem-vindos à Família MOZA INV! Como posso ajudar hoje?', time: '09:00', isAdmin: true },
    { id: '2', user: 'M. Carlos', text: 'Bom dia grupo! Alguém já recebeu o rendimento VIP 2?', time: '09:15', isAdmin: false },
  ];

  let banners: { id: string; text: string; sub: string; color: string; textColor: string; imageUrl?: string }[] = [
    { id: '1', text: 'MOZA INVESTIMENTOS LUXURY', sub: 'O seu capital, o nosso prestígio.', color: 'linear-gradient(135deg, #1e293b, #0f172a)', textColor: '#e3b341', imageUrl: 'https://picsum.photos/seed/luxury/1200/600' },
    { id: '2', text: 'OPORTUNIDADE VIP 3', sub: 'Ative hoje e ganhe 15% de bónus imediato.', color: 'linear-gradient(135deg, #14161a, #2d3748)', textColor: '#e3b341', imageUrl: 'https://picsum.photos/seed/gold/1200/600' },
    { id: '3', text: 'SUPORTE EXCLUSIVO', sub: 'Paulo Joaquim disponível via WhatsApp 24/7.', color: 'linear-gradient(135deg, #090a0c, #1e2630)', textColor: '#ffffff', imageUrl: 'https://picsum.photos/seed/support/1200/600' },
  ];

  let pendingWithdrawals: any[] = [];
  
  // New state for strict requirements
  let validInviteCode = "MOZA2026";
  let registeredUsers: { phone: string; name: string; balance: number; fundBalance: number; totalProfit: number; password?: string; inviteCode: string }[] = [
    { phone: '+55 21 98124-5002', name: 'ADMINISTRADOR', balance: 1000000, fundBalance: 0, totalProfit: 0, password: 'admin', inviteCode: 'ADMIN' },
    { phone: '123', name: 'Teste User', balance: 500, fundBalance: 0, totalProfit: 0, password: '123', inviteCode: 'MOZA2026' } // Demo user
  ];

  let pendingApprovals: { 
    id: string; 
    type: 'BANNER' | 'PAYMENT' | 'LOTTERY'; 
    user: string; 
    data: any; 
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    time: string 
  }[] = [];

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Strict Login Check
    socket.on("login_request", ({ phone, password }) => {
      const user = registeredUsers.find(u => u.phone === phone);
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
      if (userData.inviteCode !== validInviteCode) {
        socket.emit("registration_response", { success: false, message: "Código de Convite inválido!" });
        return;
      }

      if (!registeredUsers.find(u => u.phone === userData.phone)) {
        registeredUsers.push({ 
          phone: userData.phone, 
          name: 'User-' + userData.phone.slice(-4), 
          password: userData.password,
          inviteCode: userData.inviteCode || 'MOZA2026',
          balance: 0, 
          fundBalance: 0, 
          totalProfit: 0 
        });
        socket.emit("registration_response", { success: true });
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
      pendingApprovals.push(newItem);
      io.emit("new_approval_needed", newItem); // Alert Admins
      socket.emit("submission_received", { success: true, id: newItem.id });
    });

    socket.on("get_pending_approvals", () => {
      socket.emit("approvals_list", pendingApprovals.filter(a => a.status === 'PENDING'));
    });

    socket.on("get_all_users", () => {
      // Return safe user list
      const safeUsers = registeredUsers.map(({ password: _, ...u }) => u);
      socket.emit("users_list", safeUsers);
    });

    socket.on("get_system_stats", () => {
      const stats = {
        totalUsers: registeredUsers.length,
        totalBalance: registeredUsers.reduce((sum, u) => sum + u.balance, 0),
        pendingApprovals: pendingApprovals.filter(a => a.status === 'PENDING').length,
        pendingWithdrawals: pendingWithdrawals.filter(w => w.status === 'PENDING').length,
        activeBanners: banners.length,
        currentInviteCode: validInviteCode
      };
      socket.emit("system_stats", stats);
    });

    socket.on("update_invite_code", (newCode) => {
      validInviteCode = newCode;
      io.emit("new_message", { 
        id: 'sys-' + Date.now(), 
        user: 'SISTEMA', 
        text: `🔐 Código de Convite atualizado para maior segurança.`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isAdmin: true 
      });
      // Refresh stats for all admins
      const stats = {
        totalUsers: registeredUsers.length,
        totalBalance: registeredUsers.reduce((sum, u) => sum + u.balance, 0),
        pendingApprovals: pendingApprovals.filter(a => a.status === 'PENDING').length,
        pendingWithdrawals: pendingWithdrawals.filter(w => w.status === 'PENDING').length,
        activeBanners: banners.length,
        currentInviteCode: validInviteCode
      };
      io.emit("system_stats", stats);
    });

    socket.on("get_banners", () => {
      socket.emit("banners_list", banners);
    });

    socket.on("add_banner", (data) => {
      const newBanner = {
        id: Math.random().toString(36).substr(2, 9),
        ...data
      };
      banners.push(newBanner);
      io.emit("banners_list", banners);
      io.emit("new_message", { 
        id: 'b-' + newBanner.id, 
        user: 'SISTEMA', 
        text: `📢 NOVIDADE: ${newBanner.text}`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isAdmin: true 
      });
    });

    socket.on("remove_banner", (id) => {
      banners = banners.filter(b => b.id !== id);
      io.emit("banners_list", banners);
    });

    socket.on("get_pending_withdrawals", () => {
      socket.emit("withdrawals_list", pendingWithdrawals.filter(w => w.status === 'PENDING'));
    });

    socket.on("approve_withdrawal", (id) => {
      const w = pendingWithdrawals.find(x => x.id === id);
      if (w) {
        w.status = 'APPROVED';
        // Deduct balance on approval
        const user = registeredUsers.find(u => u.phone === w.phone);
        if (user) user.balance -= w.amount;
        io.emit("withdrawal_status_updated", w);
      }
    });

    socket.on("reject_withdrawal", (id) => {
      const w = pendingWithdrawals.find(x => x.id === id);
      if (w) {
        w.status = 'REJECTED';
        io.emit("withdrawal_status_updated", w);
      }
    });

    socket.on("approve_item", (id) => {
      const item = pendingApprovals.find(a => a.id === id);
      if (item) {
        item.status = 'APPROVED';
        io.emit("item_status_updated", item);
        console.log(`[ADMIN] Approved ${item.type} for ${item.user}`);
      }
    });

    socket.on("reject_item", (id) => {
      const item = pendingApprovals.find(a => a.id === id);
      if (item) {
        item.status = 'REJECTED';
        io.emit("item_status_updated", item);
        console.log(`[ADMIN] Rejected ${item.type} for ${item.user}`);
      }
    });

    // Send existing messages to the new user
    socket.emit("initial_messages", messages);

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
      messages.push(newMessage);
      if (messages.length > 50) messages.shift();
      io.emit("new_message", newMessage);
    });

    socket.on("submit_withdrawal", (data) => {
      const withdrawal = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        requestTime: new Date().toISOString()
      };
      pendingWithdrawals.push(withdrawal);
      
      // Notify Admin in chat about new request
      const adminNotice = {
        id: Math.random().toString(36).substr(2, 9),
        user: 'Admin',
        text: `📢 Novo pedido de saque: ${data.amount} MT (${data.channel}). Analisar pedido...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdmin: true
      };
      messages.push(adminNotice);
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
