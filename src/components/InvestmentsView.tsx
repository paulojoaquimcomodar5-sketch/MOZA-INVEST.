import React, { useState, useEffect } from 'react';
import { Youtube, Facebook, Music, CheckCircle2, Play, Timer, ExternalLink, ShieldCheck, Zap, Gem, Crown, AlertTriangle, Gift, BarChart3, X, HelpCircle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User as UserType, Task as TaskType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../lib/socket';
import { useTranslation } from '../lib/i18n';

interface InvestmentsViewProps {
  user: UserType | null;
  isMaintenance?: boolean;
  vipPlans?: any[];
  onNavigate?: (tab: any) => void;
}

const DEFAULT_TASKS: TaskType[] = [
  { id: 'yt_moza_main', title: 'MOZA INVEST: Estratégias de Lucro 2026', platform: 'YouTube', reward: 0, videoUrl: 'https://www.youtube.com/embed/zIwLWfaAg-8', duration: 15 },
  { id: 'yt_moza_update', title: 'Novas Atualizações VIP - Família Moza', platform: 'YouTube', reward: 0, videoUrl: 'https://www.youtube.com/embed/Py_o_h6c5uU', duration: 15 },
  { id: 'security_activation', title: 'MOZA ENCLAVE: Ativar Proteção de Elite', platform: 'YouTube', reward: 20, videoUrl: 'https://www.youtube.com/embed/1G4isv_Fylg', duration: 5 },
  { id: 'yt_moza_tutorial', title: 'Como Ativar VIP e Sacar Rendimentos', platform: 'YouTube', reward: 0, videoUrl: 'https://www.youtube.com/embed/1G4isv_Fylg', duration: 10 },
  { id: 'fb_moza', title: 'Comunidade Moza: O Futuro dos Investimentos', platform: 'Facebook', reward: 0, videoUrl: 'https://www.youtube.com/embed/0_S0SjX7q1c', duration: 12 },
];

export default function InvestmentsView({ user, isMaintenance, vipPlans = [], onNavigate }: InvestmentsViewProps) {
  const { t } = useTranslation();
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

  const currentPlan = (vipPlans || []).find(p => p.name === user?.level);
  const dailyTarget = user?.level === 'Membro Grátis' ? 0 : (currentPlan?.tasks || (vipPlans && vipPlans[0]?.tasks) || 0);
  const taskReward = currentPlan?.taskEarning || (currentPlan?.daily && currentPlan?.tasks ? (currentPlan.daily / currentPlan.tasks) : 0);

  const getRotatedTasks = () => {
    const today = new Date();
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
    let timer: NodeJS.Timeout | any;
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
      alert(t('maintenance_tasks_alert'));
      return;
    }

    const isSunday = new Date().getDay() === 0;
    // Allow performing tasks even on Sunday for better user experience/testing
    /*
    if (isSunday) {
      alert(t('sunday_restriction'));
      return;
    }
    */

    if (completedTasks.length >= dailyTarget) {
      if (dailyTarget === 0 || user?.level === 'Membro Grátis') {
        alert(t('previp_limit'));
      } else {
        alert(t('daily_limit_reached', { target: dailyTarget }));
      }
      return;
    }
    if (task.id === 'security_activation' && onNavigate) {
      onNavigate('security');
      return;
    }

    if (completedTasks.includes(task.id)) return;
    
    setActiveTask(task);
    setTimeLeft(task.duration);
    setIsWatching(true);
  };

  const handleCompleteTask = () => {
    if (activeTask && !completedTasks.includes(activeTask.id)) {
      const newCompleted = [...completedTasks, activeTask.id];
      setCompletedTasks(newCompleted);
      
      // Save locally to persist during session
      localStorage.setItem(`moza_completed_${user?.phone}_${new Date().toISOString().split('T')[0]}`, JSON.stringify(newCompleted));

      socket.emit('task_completed', {
        user: user?.phone,
        taskId: activeTask.id,
        reward: activeTask.reward,
        platform: activeTask.platform
      });
      alert(t('task_completed_msg', { reward: activeTask.reward }));
    }
  };

  // Load completed tasks from local storage
  useEffect(() => {
    if (user?.phone) {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`moza_completed_${user.phone}_${today}`);
      if (saved) {
        try {
          setCompletedTasks(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading completed tasks", e);
        }
      }
    }
  }, [user?.phone]);

  const chartData = [
    { name: 'YouTube', count: user?.completedTasksCount?.['YouTube'] || 0, color: '#FF0000' },
    { name: 'TikTok', count: user?.completedTasksCount?.['TikTok'] || 0, color: '#00F2EA' },
    { name: 'Facebook', count: user?.completedTasksCount?.['Facebook'] || 0, color: '#1877F2' }
  ];

  return (
    <div className="animate-fade px-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">{t('task_center')}</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

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
                 <h4 className="text-white font-serif italic text-lg decoration-accent decoration-2">{t('youtube_mission')}</h4>
                 <span className="text-accent text-[9px] font-black uppercase tracking-[2px]">{t('youtube_bonus_desc')}</span>
              </div>
           </div>
           
           <p className="text-text-secondary text-[11px] uppercase font-bold tracking-widest mb-4 leading-relaxed max-w-[90%]">
              {t('youtube_mission_instr')}
           </p>

           <div className="mb-6 bg-bg/40 p-4 rounded-2xl border border-white/5">
              <button 
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-2 text-accent text-[9px] font-black uppercase tracking-widest hover:underline transition-all"
              >
                <HelpCircle size={14} />
                {showTutorial ? t('hide_tutorial') : t('show_tutorial')}
              </button>
              
              {showTutorial && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="aspect-video rounded-xl overflow-hidden border border-accent/30 bg-black shadow-2xl relative">
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
                         <span className="text-accent">1.</span> {t('step1_yt')}
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="text-accent">2.</span> {t('step2_yt')}
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="text-accent">3.</span> {t('step3_yt')}
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="text-accent">4.</span> {t('step4_yt')}
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
               {t('open_channel_sub')}
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
                        alert(t('proof_sent'));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="mission-upload"
                  className="w-full bg-accent text-bg font-black py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg shadow-accent/20 cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {t('send_screenshot')}
                </label>
             </div>
           </div>
         </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-3xl mb-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            {user?.level.includes('VIP 4') ? <Crown size={80} /> : <Zap size={80} />}
         </div>
         <div className="relative z-10">
            <h4 className="text-white font-serif italic text-lg mb-1">{t('panel_vip', { level: user?.level || '' })}</h4>
            <p className="text-text-secondary text-[9px] uppercase font-bold tracking-widest mb-4">Investidor Estratégico Moza</p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-bg/40 p-4 rounded-2xl border border-white/5">
                  <small className="text-text-secondary uppercase text-[7px] tracking-[2px] block mb-1 font-black">{t('daily_target')}</small>
                  <div className="text-xl font-serif text-white">{completedTasks.length}<span className="text-xs opacity-40 ml-1">/ {dailyTarget}</span></div>
               </div>
               <div className="bg-bg/40 p-4 rounded-2xl border border-white/5">
                  <small className="text-text-secondary uppercase text-[7px] tracking-[2px] block mb-1 font-black">{t('accumulated')}</small>
                  <div className="text-xl font-serif text-accent">MZN {(completedTasks.length * taskReward).toLocaleString()}</div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-3xl mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-accent" size={18} />
          <h4 className="text-white font-serif italic text-sm">{t('activity_distribution')}</h4>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }} 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
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
              <p className="text-bg font-black text-[12px] uppercase tracking-wider">{t('daily_challenge_completed')}</p>
              <p className="text-bg/70 text-[9px] uppercase font-bold tracking-widest mt-1">
                {user?.lastDailyBonusDate === new Date().toISOString().split('T')[0] 
                  ? t('bonus_already_credited')
                  : t('bonus_ready')}
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
             <span>{user?.lastDailyBonusDate === new Date().toISOString().split('T')[0] ? t('redeemed') : t('redeem_now')}</span>
           </button>
        </div>
      )}

      <AnimatePresence>
        {isWatching && activeTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/95 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-surface border border-accent/20 rounded-3xl overflow-hidden w-full max-lg shadow-2xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Timer size={16} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('watching_in_progress')}</span>
                </div>
                <button onClick={() => setIsWatching(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary">
                  <X size={20} />
                </button>
              </div>

              <div className="aspect-video bg-black relative">
                <iframe src={getEmbedUrl(activeTask)} title="YouTube video player" className="w-full h-full" allow="autoplay" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="text-center">
                    <div className="text-5xl font-serif text-white mb-2">{timeLeft}s</div>
                    <div className="text-accent text-[8px] uppercase font-black tracking-[4px]">{t('wait_for_completion')}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <h4 className="text-white font-bold mb-1">{activeTask.title}</h4>
                  <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Plataforma: {activeTask.platform}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setIsWatching(false)} className="flex-1 bg-surface border border-border text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                    {t('close_now')}
                  </button>
                  <div className="flex-1 bg-accent/10 border border-accent/20 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[8px] text-accent uppercase font-black tracking-widest mb-1">{t('reward')}</span>
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
                {t('previp_notice')}
              </p>
            </div>
          )}
          {tasksToDisplay.length === 0 ? (
            <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-border">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary text-[10px] uppercase tracking-[2px] font-black">{t('syncing_tasks')}</p>
              <button onClick={() => socket.emit('get_tasks')} className="mt-4 text-accent text-[9px] font-bold uppercase hover:underline">{t('retry_reload')}</button>
            </div>
          ) : tasksToDisplay.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            return (
              <div key={task.id} className={`border p-5 rounded-2xl flex items-center justify-between transition-all group ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/[0.03] opacity-80' : 'bg-surface border-border hover:border-accent/40 shadow-sm'}`}>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className={`w-16 h-10 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : task.platform === 'YouTube' ? 'bg-red-500/10 text-red-500' : task.platform === 'TikTok' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-600/10 text-blue-500'}`}>
                      {getYouTubeThumbnail(task.videoUrl) ? (
                        <img src={getYouTubeThumbnail(task.videoUrl)!} alt="Thumbnail" className={`w-full h-full object-cover ${isCompleted ? 'grayscale opacity-50' : ''}`} />
                      ) : (
                        isCompleted ? <CheckCircle2 size={20} /> : task.platform === 'YouTube' ? <Youtube size={20} /> : task.platform === 'TikTok' ? <Music size={20} /> : <Facebook size={20} />
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
                       <span className="text-accent text-[9px] font-black uppercase tracking-[2px]">MZN {task.reward.toLocaleString(undefined, { minimumFractionDigits: 1 })} {t('reward')}</span>
                       {isCompleted && <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">CRÉDITO OK</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleStartTask(task)} disabled={isCompleted} className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${isCompleted ? 'text-emerald-400 border border-emerald-400/20 bg-emerald-400/5' : 'bg-accent text-bg hover:opacity-90 active:scale-95'}`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={12} />
                      {t('completed')}
                    </>
                  ) : t('watch_btn')}
                </button>
              </div>
            );
          })}
        </div>

      <div className="bg-linear-to-br from-surface/80 to-bg border border-accent/20 p-8 rounded-[2rem] text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-accent/30 rounded-full blur-[1px]"></div>
        
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent ring-4 ring-accent/5">
            <Sparkles size={32} />
          </div>
          <h4 className="text-white font-serif italic text-2xl tracking-tight">{t('how_to_earn')}</h4>
          <div className="w-12 h-0.5 bg-accent/40 rounded-full"></div>
        </div>

        <div className="space-y-6 max-w-sm mx-auto">
          {[
            { key: 'step1', icon: Gem },
            { key: 'step2', icon: Timer },
            { key: 'step3', icon: Zap }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 text-left group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent/60 group-hover:text-accent group-hover:bg-accent/10 transition-all duration-300 shrink-0">
                <item.icon size={20} />
              </div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-text-secondary group-hover:text-white transition-colors leading-relaxed font-bold">
                {t(item.key)}
              </p>
            </div>
          ))}
        </div>
        
        <p className="mt-8 text-[9px] text-accent/50 font-black uppercase tracking-[3px]">
          Moza Investimentos • 2026
        </p>
      </div>
    </div>
  );
}
