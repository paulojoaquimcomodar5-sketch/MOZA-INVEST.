import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Facebook, Music, CheckCircle2, Play, Timer, ExternalLink, ShieldCheck, Zap, Gem, Crown, AlertTriangle, Gift, BarChart3, X, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User as UserType, Task as TaskType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../lib/socket';

interface InvestmentsViewProps {
  user: UserType | null;
  isMaintenance?: boolean;
  vipPlans?: any[];
}

const tasks = []; // Removed ALL_TASKS

const DEFAULT_TASKS: TaskType[] = [
  { id: 'yt_moza_main', title: 'MOZA INVEST: Estratégias de Lucro 2026', platform: 'YouTube', reward: 0, videoUrl: 'https://www.youtube.com/embed/zIwLWfaAg-8', duration: 15 },
  { id: 'yt_moza_update', title: 'Novas Atualizações VIP - Família Moza', platform: 'YouTube', reward: 0, videoUrl: 'https://www.youtube.com/embed/Py_o_h6c5uU', duration: 15 },
  { id: 'yt_moza_tutorial', title: 'Como Ativar VIP e Sacar Rendimentos', platform: 'YouTube', reward: 0, videoUrl: 'https://www.youtube.com/embed/1G4isv_Fylg', duration: 10 },
  { id: 'fb_moza', title: 'Comunidade Moza: O Futuro dos Investimentos', platform: 'Facebook', reward: 0, videoUrl: 'https://www.youtube.com/embed/0_S0SjX7q1c', duration: 12 },
];

export default function InvestmentsView({ user, isMaintenance, vipPlans = [] }: InvestmentsViewProps) {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [serverTasks, setServerTasks] = useState<TaskType[]>(DEFAULT_TASKS);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    socket.emit('get_tasks');
    socket.on('tasks_list', (tasks: TaskType[]) => {
      setServerTasks(tasks);
    });
    return () => { socket.off('tasks_list'); };
  }, []);

  // Get current VIP plan details
  const currentPlan = (vipPlans || []).find(p => p.name === user?.level) || (vipPlans && vipPlans[0]);
  const dailyTarget = currentPlan?.tasks || 0;
  
  // Calculate reward if missing or zero
  const taskReward = currentPlan?.taskEarning || (currentPlan?.daily && currentPlan?.tasks ? (currentPlan.daily / currentPlan.tasks) : 0);

  // Rotation Logic: Use tasks from server
  const getRotatedTasks = () => {
    const today = new Date();
    // Unique number for today (YYYYMMDD)
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const sourceTasks = serverTasks.length > 0 ? serverTasks : [];
    if (sourceTasks.length === 0) return [];

    const startIndex = daySeed % sourceTasks.length;
    
    const rotated = [
      ...sourceTasks.slice(startIndex),
      ...sourceTasks.slice(0, startIndex)
    ].map(t => ({
      ...t,
      reward: taskReward
    }));
    
    return rotated.slice(0, Math.max(dailyTarget, 4));
  };

  const getEmbedUrl = (task: TaskType) => {
    if (!task) return '';
    const baseUrl = task.videoUrl;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}autoplay=1&controls=0&mute=1`;
  };

  const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
  };

  const tasksToDisplay = getRotatedTasks();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWatching && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isWatching && timeLeft === 0) {
      setIsWatching(false);
      handleCompleteTask();
    }
    return () => clearInterval(timer);
  }, [isWatching, timeLeft]);

  const handleStartTask = (task: TaskType) => {
    if (isMaintenance) {
      alert("Atenção: O sistema de tarefas está em manutenção temporária. Por favor, tente mais tarde.");
      return;
    }

    // Sunday Restriction
    const isSunday = new Date().getDay() === 0;
    if (isSunday) {
      alert("Atenção: Aos domingos não é possível realizar tarefas. Aproveite o seu dia de descanso e volte amanhã!");
      return;
    }

    if (completedTasks.length >= dailyTarget) {
      if (dailyTarget === 0) {
        alert("Você está no nível PreVIP. Faça o upgrade para um plano VIP para começar a realizar tarefas e ganhar recompensas!");
      } else {
        alert(`Limite de tarefas diárias atingido para o seu nível (${dailyTarget})!`);
      }
      return;
    }
    if (completedTasks.includes(task.id)) return;
    
    setActiveTask(task);
    setTimeLeft(task.duration);
    setIsWatching(true);
  };

  const handleCompleteTask = () => {
    if (activeTask && !completedTasks.includes(activeTask.id)) {
      setCompletedTasks([...completedTasks, activeTask.id]);
      
      // Notify Admin (Log task on server)
      socket.emit('task_completed', {
        user: user?.phone,
        taskId: activeTask.id,
        reward: activeTask.reward,
        platform: activeTask.platform
      });
      
      alert(`Tarefa Concluída! Você ganhou ${activeTask.reward} MT.`);
    }
  };

  const chartData = [
    { name: 'YouTube', count: user?.completedTasksCount?.['YouTube'] || 0, color: '#FF0000' },
    { name: 'TikTok', count: user?.completedTasksCount?.['TikTok'] || 0, color: '#00F2EA' },
    { name: 'Facebook', count: user?.completedTasksCount?.['Facebook'] || 0, color: '#1877F2' }
  ];

  return (
    <div className="animate-fade px-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">Centro de Tarefas</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      {/* SPECIAL MISSION: VERIFICATION SYSTEM - MOVED TO TOP */}
      <div className="bg-surface border border-accent/20 p-6 rounded-3xl mb-8 relative overflow-hidden group shadow-xl">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Youtube size={80} className="text-red-600" />
         </div>
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                 <Youtube size={28} />
              </div>
              <div>
                 <h4 className="text-white font-serif italic text-lg decoration-accent decoration-2">Missão MOZA YouTube</h4>
                 <span className="text-accent text-[9px] font-black uppercase tracking-[2px]">Ganhe 50 MT de Bónus</span>
              </div>
           </div>
           
           <p className="text-text-secondary text-[11px] uppercase font-bold tracking-widest mb-4 leading-relaxed max-w-[90%]">
              Subscreva o canal oficial e envie o <span className="text-white">Screenshot</span> da prova para receber o bónus após aprovação do Admin.
           </p>

           {/* Tutorial Section */}
           <div className="mb-6 bg-bg/40 p-4 rounded-2xl border border-white/5">
              <button 
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-2 text-accent text-[9px] font-black uppercase tracking-widest hover:underline transition-all"
              >
                <HelpCircle size={14} />
                {showTutorial ? 'OCULTAR TUTORIAL' : 'VER TUTORIAL: COMO TIRAR E ENVIAR O SCREENSHOT'}
              </button>
              
              {showTutorial && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="aspect-video rounded-xl overflow-hidden border border-accent/30 bg-black shadow-2xl relative">
                      {/* Substitua o ID 'zIwLWfaAg-8' pelo ID do seu vídeo real no YouTube */}
                      <iframe 
                        src="https://www.youtube.com/embed/MFl50MKn8GY" 
                        title="Tutorial de Screenshot MOZA"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                   </div>
                   <div className="mt-3 space-y-2 text-[9px] text-text-secondary uppercase font-bold tracking-widest leading-relaxed">
                      <p className="flex items-start gap-2">
                         <span className="text-accent">1.</span> Clique no botão <span className="text-white">"ABRIR CANAL E SUBSCREVER"</span>.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="text-accent">2.</span> No YouTube, clique em <span className="text-white">"Subscrever"</span> e tire um <span className="text-white">Screenshot</span>.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="text-accent">3.</span> Volte ao app e clique em <span className="text-white">"ENVIAR SCREENSHOT"</span>.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="text-accent">4.</span> Selecione a foto da sua galeria e pronto! O bónus será creditado após aprovação.
                      </p>
                   </div>
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 gap-3">
             <a 
               href="https://youtube.com/@mozainvest?si=IfrC6kDU3CzeMR6y" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-bg border border-red-500/30 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[3px] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
             >
               1. ABRIR CANAL E SUBSCREVER
               <ExternalLink size={14} />
             </a>

             <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="mission-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        socket.emit('submit_mission_proof', {
                          phone: user?.phone,
                          proofImage: reader.result,
                          taskId: 'youtube_sub_mission',
                          missionName: 'Inscrição no Canal YouTube'
                        });
                        alert("Prova enviada! Aguarde a verificação do Administrador.");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="mission-upload"
                  className="w-full bg-accent text-bg font-black py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg shadow-accent/20 cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  2. ENVIAR SCREENSHOT (PROVA)
                </label>
             </div>
           </div>
         </div>
      </div>

      {/* Stats Section */}
      <div className="bg-surface border border-border p-6 rounded-3xl mb-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            {user?.level.includes('VIP 4') ? <Crown size={80} /> : <Zap size={80} />}
         </div>
         <div className="relative z-10">
            <h4 className="text-white font-serif italic text-lg mb-1">Painel {user?.level}</h4>
            <p className="text-text-secondary text-[9px] uppercase font-bold tracking-widest mb-4">Investidor Estratégico Moza</p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-bg/40 p-4 rounded-2xl border border-white/5">
                  <small className="text-text-secondary uppercase text-[7px] tracking-[2px] block mb-1 font-black">Meta de Hoje</small>
                  <div className="text-xl font-serif text-white">{completedTasks.length}<span className="text-xs opacity-40 ml-1">/ {dailyTarget}</span></div>
               </div>
               <div className="bg-bg/40 p-4 rounded-2xl border border-white/5">
                  <small className="text-text-secondary uppercase text-[7px] tracking-[2px] block mb-1 font-black">Acumulado</small>
                  <div className="text-xl font-serif text-accent">MZN {(completedTasks.length * taskReward).toLocaleString()}</div>
               </div>
            </div>
         </div>
      </div>

      {/* New Productivity Chart Section */}
      <div className="bg-surface border border-border p-6 rounded-3xl mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-accent" size={18} />
          <h4 className="text-white font-serif italic text-sm">Distribuição de Actividades</h4>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  borderColor: '#1f2937',
                  borderRadius: '12px',
                  fontSize: '10px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#E3B341' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between mt-4">
           {chartData.map(item => (
             <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] text-text-secondary uppercase font-bold tracking-widest">{item.name}</span>
             </div>
           ))}
        </div>
      </div>

      {completedTasks.length >= dailyTarget && dailyTarget > 0 && (
        <div className="bg-linear-to-r from-accent to-accent-muted p-6 rounded-3xl mb-8 flex justify-between items-center shadow-lg shadow-accent/10 border border-white/10 group">
           <div>
              <p className="text-bg font-black text-[12px] uppercase tracking-wider">Desafio Diário Concluído!</p>
              <p className="text-bg/70 text-[9px] uppercase font-bold tracking-widest mt-1">
                {user?.lastDailyBonusDate === new Date().toISOString().split('T')[0] 
                  ? 'Bónus já creditado na sua conta' 
                  : 'O seu bónus de 25 MT está pronto'}
              </p>
           </div>
           <button 
             disabled={user?.lastDailyBonusDate === new Date().toISOString().split('T')[0]}
             onClick={() => socket.emit('claim_daily_challenge', { phone: user?.phone })}
             className={`font-black px-6 py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${
               user?.lastDailyBonusDate === new Date().toISOString().split('T')[0]
               ? 'bg-white/20 text-bg cursor-not-allowed'
               : 'bg-bg text-accent hover:bg-white active:scale-95'
             }`}
           >
             <Gift size={14} />
             <span>{user?.lastDailyBonusDate === new Date().toISOString().split('T')[0] ? 'Resgatado' : 'Resgatar Agora'}</span>
           </button>
        </div>
      )}

      <AnimatePresence>
        {isWatching && activeTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/95 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface border border-accent/20 rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Timer size={16} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Visualização em Curso</span>
                </div>
                <button 
                  onClick={() => setIsWatching(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="aspect-video bg-black relative">
                <iframe 
                  src={getEmbedUrl(activeTask)}
                  title="YouTube video player"
                  className="w-full h-full"
                  allow="autoplay"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="text-center">
                    <div className="text-5xl font-serif text-white mb-2">{timeLeft}s</div>
                    <div className="text-accent text-[8px] uppercase font-black tracking-[4px]">Aguarde a Conclusão</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <h4 className="text-white font-bold mb-1">{activeTask.title}</h4>
                  <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Plataforma: {activeTask.platform}</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsWatching(false)}
                    className="flex-1 bg-surface border border-border text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Fechar Agora
                  </button>
                  <div className="flex-1 bg-accent/10 border border-accent/20 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[8px] text-accent uppercase font-black tracking-widest mb-1">Recompensa</span>
                    <b className="text-white text-sm">MZN {activeTask.reward}</b>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 mb-10">
          {dailyTarget === 0 && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6 flex items-center gap-4">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <p className="text-[10px] text-text-secondary uppercase font-bold leading-relaxed">
                Nível <span className="text-white">PreVIP</span>: Você pode visualizar as tarefas, mas precisa de um plano VIP para ganhar recompensas.
              </p>
            </div>
          )}
          {tasksToDisplay.length === 0 ? (
            <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-border">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary text-[10px] uppercase tracking-[2px] font-black">Sincronizando Tarefas...</p>
              <button 
                onClick={() => socket.emit('get_tasks')}
                className="mt-4 text-accent text-[9px] font-bold uppercase hover:underline"
              >
                Tentar Recarregar
              </button>
            </div>
          ) : tasksToDisplay.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            return (
              <div 
                key={task.id} 
                className={`border p-5 rounded-2xl flex items-center justify-between transition-all group ${
                  isCompleted 
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03] opacity-80' 
                    : 'bg-surface border-border hover:border-accent/40 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className={`w-16 h-10 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 
                      task.platform === 'YouTube' ? 'bg-red-500/10 text-red-500' :
                      task.platform === 'TikTok' ? 'bg-cyan-500/10 text-cyan-400' :
                      'bg-blue-600/10 text-blue-500'
                    }`}>
                      {getYouTubeThumbnail(task.videoUrl) ? (
                        <img 
                          src={getYouTubeThumbnail(task.videoUrl)!} 
                          alt="Thumbnail" 
                          className={`w-full h-full object-cover ${isCompleted ? 'grayscale opacity-50' : ''}`}
                        />
                      ) : (
                        isCompleted ? <CheckCircle2 size={20} /> : 
                        task.platform === 'YouTube' ? <Youtube size={20} /> :
                        task.platform === 'TikTok' ? <Music size={20} /> :
                        <Facebook size={20} />
                      )}
                    </div>
                    {!isCompleted && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <b className={`text-[13px] block font-serif tracking-tight ${isCompleted ? 'text-emerald-400/80' : 'text-white'}`}>{task.title}</b>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-accent text-[9px] font-black uppercase tracking-[2px]">MZN {task.reward.toLocaleString(undefined, { minimumFractionDigits: 1 })} Recompensa</span>
                       {isCompleted && <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">CRÉDITO OK</span>}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleStartTask(task)}
                  disabled={isCompleted}
                  className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                    isCompleted 
                      ? 'text-emerald-400 border border-emerald-400/20 bg-emerald-400/5' 
                      : 'bg-accent text-bg hover:opacity-90 active:scale-95'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={12} />
                      CONCLUÍDA
                    </>
                  ) : 'ASSISTIR'}
                </button>
              </div>
            );
          })}
        </div>

      {/* Guide Section */}
      <div className="bg-linear-to-br from-surface to-bg border border-border p-6 rounded-2xl text-center">
        <h4 className="text-white font-serif italic text-lg mb-2">Como Ganhar?</h4>
        <div className="space-y-3 text-[10px] uppercase tracking-widest text-text-secondary leading-relaxed">
          <p>1. Selecione uma tarefa de vídeo disponível.</p>
          <p>2. Assista até o cronômetro chegar a zero.</p>
          <p>3. O saldo será creditado instantaneamente.</p>
        </div>
      </div>
    </div>
  );
}
