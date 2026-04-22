import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gem, Bomb, Wallet, Trophy, RefreshCcw, ArrowLeft, Coins, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import socket from '../lib/socket';

interface MinesGameProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

interface MinesHistoryItem {
  id: string;
  bet: number;
  mines: number;
  multiplier: number;
  profit: number;
  win: boolean;
  time: string;
}

type CellState = 'hidden' | 'gem' | 'mine';

const GRID_SIZE = 25; // 5x5

const MinesGame: React.FC<MinesGameProps> = ({ user, onBack, onUpdateUser }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [grid, setGrid] = useState<('gem' | 'mine')[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>(new Array(GRID_SIZE).fill(false));
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended' | 'cashed_out'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [nextMultiplier, setNextMultiplier] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<MinesHistoryItem[]>([]);

  // Load history from session storage to persist during current session
  useEffect(() => {
    const saved = sessionStorage.getItem('mines_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (item: MinesHistoryItem) => {
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    sessionStorage.setItem('mines_history', JSON.stringify(newHistory));
  };

  // Calculate multipliers based on number of gems already revealed
  const calculateMultiplier = (numMines: number, numGemsRevealed: number) => {
    // Formula for fair multiplier (house edge included)
    // Prob = (Total - Mines - RevealedGems) / (Total - RevealedGems)
    // Multiplier = 1 / Prob * 0.96 (4% house edge)
    
    let multiplier = 1;
    const houseEdge = 0.97; // 3%
    
    // We calculate the cumulative probability
    // For the first gem: (25-M) / 25
    // For the second: (24-M) / 24, etc.
    let prob = 1;
    for (let i = 0; i < numGemsRevealed; i++) {
        prob *= (GRID_SIZE - numMines - i) / (GRID_SIZE - i);
    }
    
    multiplier = (1 / prob) * houseEdge;
    return Number(multiplier.toFixed(2));
  };

  const calculateNextMultiplier = (numMines: number, numGemsRevealed: number) => {
    return calculateMultiplier(numMines, numGemsRevealed + 1);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const revealedCount = revealed.filter(v => v).length;
      setCurrentMultiplier(calculateMultiplier(minesCount, revealedCount));
      setNextMultiplier(calculateNextMultiplier(minesCount, revealedCount));
    }
  }, [revealed, gameState, minesCount]);

  const startGame = () => {
    setValidationError(null);
    
    if (betAmount < 10) {
      setValidationError("Aposta mínima permitida: 10 MT");
      return;
    }
    
    if (betAmount > user.balance) {
      setValidationError("Saldo insuficiente para esta aposta");
      return;
    }

    setIsLoading(true);
    
    // Debit user balance via socket
    socket.emit("update_user_balance", { phone: user.phone, amount: -betAmount });
    
    // Initialize grid
    const newGrid: ('gem' | 'mine')[] = new Array(GRID_SIZE).fill('gem');
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      if (newGrid[randomIndex] === 'gem') {
        newGrid[randomIndex] = 'mine';
        minesPlaced++;
      }
    }

    setGrid(newGrid);
    setRevealed(new Array(GRID_SIZE).fill(false));
    setGameState('playing');
    setCurrentMultiplier(1);
    setIsLoading(false);
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index] === 'mine') {
      setGameState('ended');
      // Record loss
      saveHistory({
        id: Math.random().toString(36).substr(2, 9),
        bet: betAmount,
        mines: minesCount,
        multiplier: 0,
        profit: -betAmount,
        win: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      // Check if all gems are revealed (extreme win)
      const revealedCount = newRevealed.filter(v => v).length;
      if (revealedCount === GRID_SIZE - minesCount) {
        cashOut();
      }
    }
  };

  const cashOut = () => {
    if (gameState !== 'playing') return;

    const winAmount = Math.floor(betAmount * currentMultiplier);
    setIsLoading(true);
    
    // Credit user winnings
    socket.emit("update_user_balance", { phone: user.phone, amount: winAmount });
    
    // Record win
    saveHistory({
      id: Math.random().toString(36).substr(2, 9),
      bet: betAmount,
      mines: minesCount,
      multiplier: currentMultiplier,
      profit: winAmount - betAmount,
      win: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    setGameState('cashed_out');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="bg-surface border-b border-border p-4 sticky top-0 z-20 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[3px] text-accent">Moza Mines</span>
          <div className="flex items-center gap-2">
            <Gem className="text-accent" size={14} />
            <span className="text-white font-serif italic text-lg tracking-tight">Ouro & Minas</span>
          </div>
        </div>
        <div className="bg-bg/50 px-3 py-1.5 rounded-full border border-accent/10 flex items-center gap-2 shadow-inner">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-white font-mono text-xs">{user.balance.toLocaleString()} MT</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* multiplier Display */}
        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center space-y-2 overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Trophy size={80} />
            </div>
            <p className="text-accent text-[10px] font-black uppercase tracking-[2px]">Multiplicador Atual</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-5xl font-black text-white">{currentMultiplier}</span>
              <span className="text-accent text-xl font-bold mb-1">x</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-text-secondary text-xs">
              <span>Próximo:</span>
              <span className="text-white font-bold">{nextMultiplier}x</span>
            </div>
          </motion.div>
        )}

        {/* Game Grid */}
        <div className="grid grid-cols-5 gap-2 bg-surface/50 p-3 rounded-[24px] border border-border shadow-2xl relative overflow-hidden">
          {grid.length === 0 ? (
            // Placeholder before game starts
            new Array(25).fill(null).map((_, i) => (
              <div key={i} className="aspect-square bg-surface border border-border rounded-lg shadow-inner opacity-40" />
            ))
          ) : (
            grid.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={!revealed[index] && gameState === 'playing' ? { scale: 1.05 } : {}}
                whileTap={!revealed[index] && gameState === 'playing' ? { scale: 0.95 } : {}}
                onClick={() => handleCellClick(index)}
                disabled={gameState !== 'playing' || revealed[index]}
                className={`aspect-square rounded-xl border flex items-center justify-center transition-all duration-500 relative ${
                  revealed[index] 
                    ? cell === 'gem' 
                      ? 'bg-accent/10 border-accent/30 shadow-[inset_0_0_20px_rgba(227,179,65,0.1)]' 
                      : 'bg-red-500/20 border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]'
                    : 'bg-surface border-border hover:border-accent/40 shadow-xl'
                }`}
              >
                {revealed[index] ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -200 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  >
                    {cell === 'gem' ? (
                      <div className="relative">
                        <Gem className="text-accent" size={24} />
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute -top-1 -right-1 text-white"
                        >
                          <Trophy size={10} />
                        </motion.div>
                      </div>
                    ) : (
                      <Bomb className="text-red-500" size={24} />
                    )}
                  </motion.div>
                ) : (
                    gameState === 'ended' || gameState === 'cashed_out' ? (
                       <div className="opacity-10">
                         {cell === 'gem' ? <Gem size={16} /> : <Bomb size={16} />}
                       </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/5" />
                    )
                )}
              </motion.button>
            ))
          )}

          {/* End Game Overlay */}
          <AnimatePresence>
            {(gameState === 'ended' || gameState === 'cashed_out') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-bg/60 backdrop-blur-sm flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-surface border border-border p-8 rounded-[32px] text-center shadow-2xl relative w-full"
                >
                  {gameState === 'cashed_out' ? (
                    <>
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
                        <Trophy className="text-accent" size={32} />
                      </div>
                      <h3 className="text-white text-xl font-serif italic mb-1">Grande Vitória!</h3>
                      <p className="text-accent font-black text-2xl mb-4">+{Math.floor(betAmount * currentMultiplier)} MT</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                        <Bomb className="text-red-500" size={32} />
                      </div>
                      <h3 className="text-white text-xl font-serif italic mb-1">Ups! Mina Atingida</h3>
                      <p className="text-text-secondary text-xs mb-4">Sorte na próxima vez, investidor.</p>
                      <p className="text-red-500/80 font-black text-lg mb-6">-{betAmount} MT</p>
                    </>
                  )}
                  <button
                    onClick={() => setGameState('idle')}
                    className="w-full bg-accent text-bg font-black text-[10px] uppercase tracking-[3px] py-4 rounded-2xl shadow-lg shadow-accent/20"
                  >
                    Tentar Novamente
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="bg-surface rounded-[24px] border border-border p-6 space-y-6 shadow-xl">
          {gameState === 'idle' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-text-secondary flex items-center gap-2">
                    <Wallet size={12} /> Aposta (MT)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={betAmount}
                      onChange={(e) => {
                        setBetAmount(Math.max(0, parseInt(e.target.value) || 0));
                        setValidationError(null);
                      }}
                      className={`w-full bg-bg border p-3 rounded-xl text-white font-mono text-sm outline-none transition-all ${validationError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-border focus:border-accent'}`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button onClick={() => setBetAmount(Math.floor(betAmount/2))} className="bg-surface border border-border px-1.5 py-1 rounded text-[8px] font-black text-accent hover:bg-accent/10">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} className="bg-surface border border-border px-1.5 py-1 rounded text-[8px] font-black text-accent hover:bg-accent/10">2x</button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-text-secondary flex items-center gap-2">
                    <Bomb size={12} /> Minas (1-24)
                  </label>
                  <select 
                    value={minesCount}
                    onChange={(e) => setMinesCount(parseInt(e.target.value))}
                    className="w-full bg-bg border border-border p-3 rounded-xl text-white text-sm outline-none focus:border-accent appearance-none"
                  >
                    {[1, 3, 5, 10, 15, 20, 24].map(n => (
                      <option key={n} value={n}>{n} Minas</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 500, 1000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setBetAmount(val)}
                    className={`bg-bg border text-[9px] font-black uppercase tracking-[1px] py-2 rounded-lg transition-all ${betAmount === val ? 'border-accent text-accent shadow-[0_0_10px_rgba(227,179,65,0.1)]' : 'border-border text-text-secondary opacity-60'}`}
                  >
                    {val} MT
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {validationError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-500/5 p-2 rounded-lg border border-red-500/10"
                  >
                    <AlertTriangle size={12} />
                    {validationError}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                onClick={startGame}
                disabled={isLoading}
                animate={validationError ? { x: [-2, 2, -2, 2, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-full bg-accent text-bg font-black text-[10px] uppercase tracking-[3px] py-5 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCcw className="animate-spin" size={16} /> : <Coins size={16} />}
                Girar e Apostar
              </motion.button>
            </>
          ) : gameState === 'playing' ? (
            <>
              <div className="flex items-center justify-between bg-bg/50 p-4 rounded-xl border border-accent/10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-text-secondary uppercase tracking-[2px]">Podes Retirar</p>
                  <p className="text-white font-mono text-lg font-black tracking-tight">{(Math.floor(betAmount * currentMultiplier)).toLocaleString()} MT</p>
                </div>
                <Trophy className="text-accent opacity-30" size={32} />
              </div>

              <button 
                onClick={cashOut}
                disabled={isLoading || revealed.filter(v => v).length === 0}
                className={`w-full bg-accent text-bg font-black text-[10px] uppercase tracking-[3px] py-5 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${revealed.filter(v => v).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? <RefreshCcw className="animate-spin" size={16} /> : <Wallet size={16} />}
                CASH OUT ({currentMultiplier}x)
              </button>
              
              <div className="flex items-center gap-2 justify-center text-[10px] font-black uppercase tracking-[2px] text-text-secondary opacity-60">
                 <AlertTriangle size={12} className="text-accent" />
                 <span>Cuidado com as Minas</span>
              </div>
            </>
          ) : (
            <button 
              onClick={() => setGameState('idle')}
              className="w-full bg-surface border border-border text-white font-black text-[10px] uppercase tracking-[3px] py-5 rounded-2xl active:scale-95 transition-all"
            >
              Nova Rodada
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="bg-surface/30 rounded-2xl p-4 border border-border flex justify-around">
          <div className="text-center">
            <p className="text-[8px] font-black text-text-secondary uppercase tracking-[1px] mb-1">Saldo de Jogo</p>
            <p className="text-white font-mono text-sm">{user.balance.toLocaleString()} MT</p>
          </div>
          <div className="w-[1px] bg-border" />
          <div className="text-center">
            <p className="text-[8px] font-black text-text-secondary uppercase tracking-[1px] mb-1">Melhor Multi</p>
            <p className="text-accent font-mono text-sm">24.5x</p>
          </div>
          <div className="w-[1px] bg-border" />
          <div className="text-center">
            <p className="text-[8px] font-black text-text-secondary uppercase tracking-[1px] mb-1">Minas Ativas</p>
            <p className="text-white font-mono text-sm">{minesCount}</p>
          </div>
        </div>

        {/* History Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[2px] text-white">Histórico Recente</h4>
            <span className="text-[8px] text-text-secondary uppercase">Últimas 10 Rodadas</span>
          </div>
          
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {history.length === 0 ? (
                <div className="bg-surface/20 border border-dashed border-border p-8 rounded-2xl text-center">
                  <p className="text-[10px] text-text-secondary uppercase tracking-[1px]">Nenhuma rodada no histórico</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-surface/50 border border-border p-3 rounded-xl flex items-center justify-between group hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.win ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}`}>
                        {item.win ? <Trophy size={16} /> : <Bomb size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs font-bold">{item.bet} MT</span>
                          <span className="text-[10px] text-text-secondary">({item.mines} minas)</span>
                        </div>
                        <p className="text-[9px] text-text-secondary font-mono">{item.time}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xs font-black font-mono ${item.win ? 'text-accent' : 'text-red-500'}`}>
                        {item.win ? `+${item.profit}` : item.profit} MT
                      </p>
                      <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">
                        {item.multiplier}x
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;
