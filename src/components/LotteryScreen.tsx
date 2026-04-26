import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Ticket, ArrowLeft, Coins, Bomb, Gem, Skull, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface MinesGameProps {
  onBack: () => void;
  balance: number;
  tickets: number;
  onDraw: (cost: number, win: number, isTicket: boolean) => void;
  onRecharge: () => void;
  isMaintenance?: boolean;
}

const GRID_SIZE = 25; // 5x5

export default function LotteryScreen({ onBack, balance, tickets, onDraw, onRecharge, isMaintenance }: MinesGameProps) {
  const { t } = useTranslation();
  const [mineCount, setMineCount] = useState(3);
  const [betAmount, setBetAmount] = useState(50);
  const [useTicket, setUseTicket] = useState(false);
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'ENDED' | 'CASHED_OUT'>('IDLE');
  const [grid, setGrid] = useState<('GEM' | 'MINE' | 'HIDDEN')[]>(new Array(GRID_SIZE).fill('HIDDEN'));
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [currentProfit, setCurrentProfit] = useState(0);

  const getMultiplier = (gems: number, mines: number) => {
    if (gems === 0) return 1;
    let prob = 1;
    for (let i = 0; i < gems; i++) {
        prob *= (GRID_SIZE - mines - i) / (GRID_SIZE - i);
    }
    return parseFloat((0.97 / prob).toFixed(2));
  };

  const startGame = () => {
    if (isMaintenance) {
      alert(t('maintenance_mines_alert'));
      return;
    }

    const cost = useTicket ? 0 : betAmount;
    if (!useTicket && balance < betAmount) return alert(t('insufficient_balance_game'));
    if (useTicket && tickets < 1) return alert(t('no_tickets'));

    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!newMines.includes(pos)) newMines.push(pos);
    }

    setMines(newMines);
    setRevealed([]);
    setGrid(new Array(GRID_SIZE).fill('HIDDEN'));
    setMultiplier(1);
    setCurrentProfit(0);
    setGameState('PLAYING');
    onDraw(useTicket ? 1 : betAmount, 0, useTicket);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'PLAYING' || revealed.includes(index)) return;

    if (mines.includes(index)) {
      setRevealed([...revealed, index]);
      setGameState('ENDED');
    } else {
      const newRevealed = [...revealed, index];
      setRevealed(newRevealed);
      const newMult = getMultiplier(newRevealed.length, mineCount);
      setMultiplier(newMult);
      const baseValue = useTicket ? 100 : betAmount;
      setCurrentProfit(Math.floor(baseValue * newMult));
      if (newRevealed.length === GRID_SIZE - mineCount) {
        cashOut(newRevealed.length);
      }
    }
  };

  const cashOut = (gemsFound?: number) => {
    if (gameState !== 'PLAYING') return;
    const count = gemsFound ?? revealed.length;
    if (count === 0) return;
    const finalMult = getMultiplier(count, mineCount);
    const win = Math.floor((useTicket ? 100 : betAmount) * finalMult);
    onDraw(0, win, false);
    setGameState('CASHED_OUT');
  };

  const reset = () => {
    setGameState('IDLE');
    setRevealed([]);
    setGrid(new Array(GRID_SIZE).fill('HIDDEN'));
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col font-sans overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#e3b34120_0%,_transparent_50%)] opacity-30" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20 pointer-events-none" />

      <header className="relative z-10 px-6 pt-8 pb-4 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-serif italic tracking-tighter text-accent">{t('gold_mine')}</h2>
          <p className="text-[8px] uppercase tracking-[3px] text-text-secondary">Luxury Gaming</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xs mb-6 grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border p-3 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={10} className="text-accent" />
              <span className="text-[8px] uppercase font-black tracking-widest text-text-secondary">{t('multiplier')}</span>
            </div>
            <p className="text-2xl font-serif text-white">{multiplier}x</p>
          </div>
          <motion.div key={currentProfit} initial={{ scale: 1.1, color: '#e3b341' }} animate={{ scale: 1, color: '#fff' }} className="bg-accent/10 border border-accent/20 p-3 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Coins size={10} className="text-accent" />
              <span className="text-[8px] uppercase font-black tracking-widest text-accent">{t('current_profit')}</span>
            </div>
            <p className="text-2xl font-serif">MZN {currentProfit.toLocaleString()}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-5 gap-2 w-full max-w-sm aspect-square">
          {new Array(GRID_SIZE).fill(0).map((_, i) => {
            const isRevealed = revealed.includes(i);
            const isMine = mines.includes(i);
            const isGameOver = gameState === 'ENDED' || gameState === 'CASHED_OUT';
            return (
              <motion.button
                key={i}
                whileHover={!isRevealed && !isGameOver ? { scale: 1.05, backgroundColor: 'rgba(227, 179, 65, 0.1)' } : {}}
                whileTap={!isRevealed && !isGameOver ? { scale: 0.95 } : {}}
                onClick={() => handleTileClick(i)}
                className={`aspect-square rounded-lg border transition-all duration-300 flex items-center justify-center relative overflow-hidden ${isRevealed ? (isMine ? 'bg-red-500/20 border-red-500/40' : 'bg-emerald-500/20 border-emerald-500/40 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]') : (isGameOver && isMine ? 'bg-red-500/10 border-red-500/20 grayscale translate-y-1' : 'bg-surface border-border hover:border-accent/40')}`}
              >
                {isRevealed || (isGameOver && isMine) ? (
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
                    {isMine ? <Bomb className={isRevealed ? "text-red-500" : "text-red-400 opacity-50"} size={24} /> : <Gem className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" size={24} />}
                  </motion.div>
                ) : (
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                )}
                {!isRevealed && !isGameOver && (
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
            {gameState === 'ENDED' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-red-500">
                  <Skull size={20} />
                  <b className="font-serif italic text-xl uppercase tracking-widest">{t('boom_msg')}</b>
                </div>
                <p className="text-[10px] text-text-secondary uppercase tracking-[2px]">{t('hit_mine')}</p>
                <button onClick={reset} className="mt-4 bg-white text-bg px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[3px]">{t('try_again')}</button>
              </motion.div>
            )}
            {gameState === 'CASHED_OUT' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-accent">
                  <Trophy size={20} />
                  <b className="font-serif italic text-xl uppercase tracking-widest">{t('supremo_msg')}</b>
                </div>
                <p className="text-[10px] text-text-secondary uppercase tracking-[2px]">{t('win_claim_msg', { amount: currentProfit.toLocaleString() })}</p>
                <button onClick={reset} className="mt-4 bg-accent text-bg px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[3px]">{t('new_game')}</button>
              </motion.div>
            )}
        </AnimatePresence>
      </main>

      <footer className="bg-surface border-t border-border p-6 pb-12 relative z-20">
        {gameState === 'IDLE' ? (
          <div className="space-y-6 max-w-sm mx-auto">
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">{t('mine_count')}</label>
                    <div className="flex items-center gap-2 bg-bg border border-border p-1 rounded-xl">
                        {[1, 3, 5, 10].map(n => (
                            <button key={n} onClick={() => setMineCount(n)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${mineCount === n ? 'bg-accent text-bg' : 'text-text-secondary'}`}>{n}</button>
                        ))}
                        <input type="number" min="1" max="24" value={mineCount} onChange={(e) => setMineCount(Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))} className="w-12 bg-transparent text-center text-[10px] font-bold text-white outline-none" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2">{t('bet_label')}</label>
                    <div className="flex gap-2">
                        <button onClick={() => setUseTicket(false)} className={`flex-1 p-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${!useTicket ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary'}`}>
                            <Coins size={14} />
                            <span className="text-[10px] font-bold tracking-widest">{t('balance_label')}</span>
                        </button>
                        <button onClick={() => setUseTicket(true)} className={`flex-1 p-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${useTicket ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary'}`}>
                            <Ticket size={14} />
                            <span className="text-[10px] font-bold tracking-widest">{t('ticket_label')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {!useTicket && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[50, 100, 500, 1000, 5000].map(amt => (
                        <button key={amt} onClick={() => setBetAmount(amt)} className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold transition-all border ${betAmount === amt ? 'bg-white text-bg border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-bg text-text-secondary border-border'}`}>{amt}</button>
                    ))}
                </div>
            )}

            <button onClick={startGame} className="w-full bg-accent text-bg font-black py-4 rounded-xl text-[12px] uppercase tracking-[4px] shadow-xl shadow-accent/20 active:scale-95 transition-all">{t('start_exploration')}</button>
          </div>
        ) : gameState === 'PLAYING' ? (
          <div className="max-w-sm mx-auto flex gap-4">
             <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col justify-center">
                <div className="flex items-center gap-2 opacity-60">
                   <ShieldCheck size={12} className="text-emerald-400" />
                   <span className="text-[8px] uppercase font-black tracking-widest">{t('security')}</span>
                </div>
                <p className="text-[10px] text-text-secondary mt-1 tracking-tight">{t('go_carefully')}</p>
             </div>
             <button onClick={() => cashOut()} disabled={revealed.length === 0} className="flex-[1.5] bg-emerald-500 text-bg font-black py-4 rounded-xl text-[12px] uppercase tracking-[4px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50">{t('cash_out')}</button>
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
             <button onClick={reset} className="w-full bg-surface border border-border text-white font-black py-4 rounded-xl text-[12px] uppercase tracking-[4px] active:scale-95 transition-all">{t('back_to_menu')}</button>
          </div>
        )}
      </footer>
    </div>
  );
}
