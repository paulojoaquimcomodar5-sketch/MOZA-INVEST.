import React, { useState, useEffect, useRef } from 'react';
import { Youtube, CheckCircle2, Play, Timer, ExternalLink, ShieldCheck, Zap, Gem, Crown, AlertTriangle } from 'lucide-react';
import { User as UserType, Task as TaskType } from '../types';
import { VIP_PLANS } from '../constants';
import socket from '../lib/socket';

interface InvestmentsViewProps {
  user: UserType | null;
  isMaintenance?: boolean;
}

const YOUTUBE_TASKS: TaskType[] = [
  { id: 'yt1', title: 'Como Investir na Bolsa (Iniciantes)', platform: 'YouTube', reward: 12, videoUrl: 'https://www.youtube.com/embed/zIwLWfaAg-8', duration: 15 },
  { id: 'yt2', title: 'O Futuro da Fintech em África', platform: 'YouTube', reward: 12, videoUrl: 'https://www.youtube.com/embed/Py_o_h6c5uU', duration: 15 },
  { id: 'yt3', title: 'Estratégias de Renda Passiva 2026', platform: 'YouTube', reward: 15, videoUrl: 'https://www.youtube.com/embed/1G4isv_Fylg', duration: 20 },
  { id: 'yt4', title: 'Gestão de Ativos Digitais: Guia Médio', platform: 'YouTube', reward: 20, videoUrl: 'https://www.youtube.com/embed/0_S0SjX7q1c', duration: 25 },
  { id: 'yt5', title: 'Análise de Risco em Investimentos', platform: 'YouTube', reward: 25, videoUrl: 'https://www.youtube.com/embed/Gv66YIiaRHY', duration: 30 },
  { id: 'yt6', title: 'Crescimento Económico em Moçambique', platform: 'YouTube', reward: 30, videoUrl: 'https://www.youtube.com/embed/_fI-OswR6Yk', duration: 35 },
  { id: 'yt7', title: 'Literacia Financeira para Jovens', platform: 'YouTube', reward: 12, videoUrl: 'https://www.youtube.com/embed/8-P_D08m-0E', duration: 15 },
  { id: 'yt8', title: 'Blockchain e o Setor Bancário', platform: 'YouTube', reward: 18, videoUrl: 'https://www.youtube.com/embed/QCvL7vUad38', duration: 20 },
  { id: 'yt9', title: 'O Poder dos Juros Compostos', platform: 'YouTube', reward: 15, videoUrl: 'https://www.youtube.com/embed/fduC87p-G6M', duration: 18 },
  { id: 'yt10', title: 'Mercado de Capitais em Moçambique', platform: 'YouTube', reward: 22, videoUrl: 'https://www.youtube.com/embed/_fI-OswR6Yk', duration: 28 },
];

export default function InvestmentsView({ user, isMaintenance }: InvestmentsViewProps) {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(false);

  // Determine how many tasks the user can do based on VIP level
  const getDailyTarget = () => {
    const level = user?.level || 'PreVIP';
    if (level === 'VIP 4') return 6;
    if (level === 'VIP 3') return 5;
    if (level === 'VIP 2') return 3;
    if (level === 'VIP 1') return 3;
    return 0; // PreVIP has 0 tasks until upgrade
  };

  const dailyTarget = getDailyTarget();
  const currentPlan = VIP_PLANS.find(p => p.name === (user?.level || 'PreVIP'));

  // Rotation Logic: Tasks rotate based on the day of the year
  const getRotatedTasks = () => {
    const today = new Date();
    // Unique number for today (YYYYMMDD)
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const startIndex = daySeed % YOUTUBE_TASKS.length;
    
    // Create a shifted copy of the tasks (circular buffer style)
    const rotated = [
      ...YOUTUBE_TASKS.slice(startIndex),
      ...YOUTUBE_TASKS.slice(0, startIndex)
    ].map(t => ({
      ...t,
      reward: currentPlan ? currentPlan.taskEarning : 0
    }));
    
    // Return a slice based on daily target or a minimum of 4 for variety
    return rotated.slice(0, Math.max(dailyTarget, 4));
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
      alert(`Limite de tarefas diárias atingido para o seu nível! (${dailyTarget})`);
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
        reward: activeTask.reward
      });
      
      alert(`Tarefa Concluída! Você ganhou ${activeTask.reward} MT.`);
    }
  };

  return (
    <div className="animate-fade px-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">Centro de Tarefas</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-surface border border-border p-5 rounded-2xl">
          <small className="text-text-secondary uppercase text-[8px] tracking-[2px] block mb-1 font-black">Tarefas Diárias</small>
          <div className="text-lg font-serif text-white">{completedTasks.length} / {dailyTarget}</div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl">
          <small className="text-text-secondary uppercase text-[8px] tracking-[2px] block mb-1 font-black">Lucro de Hoje</small>
          <div className="text-lg font-serif text-accent">{completedTasks.length * (currentPlan?.taskEarning || 0)} MT</div>
        </div>
      </div>

      {/* Task Interface */}
      {isWatching && activeTask ? (
        <div className="bg-surface border border-accent/30 rounded-2xl overflow-hidden mb-10 shadow-2xl">
          <div className="aspect-video bg-black relative">
            <iframe 
              src={`${activeTask.videoUrl}?autoplay=1&controls=0&mute=1`}
              title="YouTube video player"
              className="w-full h-full pointer-events-none"
              allow="autoplay"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
              <div className="text-center">
                <div className="text-5xl font-serif text-white mb-2">{timeLeft}s</div>
                <div className="text-accent text-[8px] uppercase font-black tracking-[4px]">Aguarde a Conclusão</div>
              </div>
            </div>
          </div>
          <div className="p-6 text-center">
            <h4 className="text-white font-bold mb-1">{activeTask.title}</h4>
            <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Plataforma: {activeTask.platform}</p>
          </div>
        </div>
      ) : dailyTarget === 0 ? (
        <div className="bg-surface border border-border p-10 rounded-2xl text-center mb-10">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
          <h4 className="text-white font-serif text-xl mb-2">Acesso Restrito</h4>
          <p className="text-text-secondary text-xs leading-relaxed uppercase tracking-wider mb-8">
            Você está no nível <span className="text-white">PreVIP</span>. Faça o upgrade para um nível VIP para começar a ganhar saldo assistindo vídeos.
          </p>
          <button className="text-accent text-[10px] uppercase font-black tracking-[3px] border-b border-accent/30 pb-1">Ver Planos VIP</button>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {tasksToDisplay.map((task) => {
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : <Youtube size={24} />}
                  </div>
                  <div className="text-left">
                    <b className={`text-[13px] block font-serif tracking-tight ${isCompleted ? 'text-emerald-400/80' : 'text-white'}`}>{task.title}</b>
                    <span className="text-accent text-[9px] font-black uppercase tracking-[2px]">{task.reward} MT Recompensa</span>
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
      )}

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
