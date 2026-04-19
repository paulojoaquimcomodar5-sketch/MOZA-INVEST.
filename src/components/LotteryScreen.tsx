import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { Trophy, Ticket, ArrowLeft, Coins, Star } from 'lucide-react';
import Logo from './Logo';

interface LotteryScreenProps {
  onBack: () => void;
  balance: number;
  tickets: number;
  onDraw: (cost: number, win: number, ticketWin: boolean) => void;
  onRecharge: () => void;
}

const WHEEL_DATA = [
  { value: '10 MT', amount: 10, color: '#FFB800', textColor: '#330000' },     // Yellow-Orange
  { value: '50 MT', amount: 50, color: '#0075FF', textColor: '#FFFFFF' },     // Deep Blue
  { value: '70 MT', amount: 70, color: '#9C27B0', textColor: '#FFFFFF' },     // Purple
  { value: '500 MT', amount: 500, color: '#E53935', textColor: '#FFFFFF' },   // Crimson Red
  { value: '1000 MT', amount: 1000, color: '#00BFA5', textColor: '#FFFFFF' }, // Teal/Cyan
  { value: '2500 MT', amount: 2500, color: '#FF00A8', textColor: '#FFFFFF' }, // Hot Pink
  { value: '5000 MT', amount: 5000, color: '#6200EA', textColor: '#FFFFFF' }, // Indigo/Deep Purple
  { value: 'CHANCE', amount: 0, color: '#4CAF50', textColor: '#FFFFFF', isChance: true } // Green
];

export default function LotteryScreen({ onBack, balance, tickets, onDraw, onRecharge }: LotteryScreenProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();

  const handleSpin = async () => {
    if (isSpinning) return;
    if (balance < 50 && tickets < 1) {
      alert("Saldo insuficiente (Mínimo 50 MT ou 1 Ticket para girar)");
      return;
    }

    setIsSpinning(true);
    const cost = tickets > 0 ? 0 : 50;

    const segmentCount = WHEEL_DATA.length;
    const winningIndex = Math.floor(Math.random() * segmentCount);
    const segmentWidth = 360 / segmentCount;
    
    // Calculate winning degree (centered in segment)
    const targetDegree = (360 - (winningIndex * segmentWidth) - (segmentWidth / 2)) % 360;
    
    // Calculate total rotation (current + several full spins + target)
    const currentRotMod = rotation % 360;
    const delta = (targetDegree - currentRotMod + 360) % 360;
    const finalRotation = rotation + (360 * 10) + delta;
    
    setRotation(finalRotation);

    await controls.start({
      rotate: finalRotation,
      transition: { 
        duration: 7, 
        ease: [0.2, 0, 0, 1] // Custom ease for "clicking" feel then smooth stop
      }
    });

    const result = WHEEL_DATA[winningIndex];
    
    setTimeout(() => {
      onDraw(cost, result.amount, result.isChance || false);
      setIsSpinning(false);
      
      if (result.isChance) {
        alert("SORTE! Ganhou 1 TICKET extra!");
      } else {
        alert(`PARABÉNS! Ganhou ${result.amount} MT!`);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-[#0A051E] flex flex-col font-sans overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-radial from-blue-900/20 via-transparent to-transparent opacity-50 blur-[100px]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 pt-10 pb-6 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block"
        >
          <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-[#FFF5D1] via-[#D4AF37] to-[#8B6B00] drop-shadow-2xl uppercase">
            Roda da Sorte
          </h1>
          <div className="relative mt-2">
            <div className="bg-linear-to-r from-transparent via-purple-600 to-transparent h-[1px] w-full absolute top-1/2 -translate-y-1/2" />
            <div className="bg-purple-800 text-white text-[9px] font-black uppercase tracking-[3px] px-8 py-1.5 rounded-sm relative inline-block border-x border-purple-400">
              Tente a sua sorte!
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-1 group">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full backdrop-blur-sm">
                <Coins size={12} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-[2px] text-accent/80">Valor Mínimo: <span className="text-white">50 MT</span></span>
             </div>
             <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">(ou 1 Ticket)</p>
          </div>
        </motion.div>
      </div>

      {/* Main Wheel Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 -mt-6">
        <div className="relative w-72 h-72">
          
          {/* External Gold Ring with Cinematic Lights */}
          <div className="absolute -inset-5 border-[12px] border-[#D4AF37] rounded-full shadow-[0_0_40px_rgba(212,175,55,0.3),inset_0_0_20px_rgba(0,0,0,0.5)] z-20 overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-tr from-[#D4AF37] via-white/40 to-[#8B6B00] opacity-20" />
             <div className="absolute inset-0 rounded-full border border-white/30" />
             {[...Array(16)].map((_, i) => (
               <div 
                 key={i} 
                 className="absolute w-2 h-2 rounded-full shadow-[0_0_10px_white]"
                 style={{ 
                   backgroundColor: i % 2 === 0 ? '#FFF' : '#FFD700',
                   top: '50%', left: '50%',
                   transform: `rotate(${i * 22.5}deg) translate(154px)` ,
                   animation: `pulse 1.5s infinite ${i * 0.1}s`
                 }}
               />
             ))}
          </div>

          {/* Top Pointer - High Contrast */}
          <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 z-40">
             <div className="w-12 h-14 relative flex flex-col items-center">
                <div className="w-10 h-10 bg-linear-to-b from-[#FFF5D1] to-[#D4AF37] rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-linear-to-br from-white to-gray-200 rounded-full border border-amber-500/30" />
                </div>
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white -mt-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
             </div>
          </div>

          {/* The Actual Spinning Wheel */}
          <div className="w-full h-full rounded-full border-[8px] border-[#3D002E] relative overflow-hidden bg-surface shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <motion.div
              animate={controls}
              className="w-full h-full relative origin-center"
              style={{
                background: `conic-gradient(
                  ${WHEEL_DATA[0].color} 0% 12.5%, 
                  ${WHEEL_DATA[1].color} 12.5% 25%, 
                  ${WHEEL_DATA[2].color} 25% 37.5%, 
                  ${WHEEL_DATA[3].color} 37.5% 50%, 
                  ${WHEEL_DATA[4].color} 50% 62.5%, 
                  ${WHEEL_DATA[5].color} 62.5% 75%, 
                  ${WHEEL_DATA[6].color} 75% 87.5%, 
                  ${WHEEL_DATA[7].color} 87.5% 100%
                )`
              }}
            >
               {/* Internal Dividers for segments */}
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="absolute top-0 left-1/2 h-full w-[2px] bg-black/20 origin-bottom" style={{ transform: `rotate(${i * 45}deg) translateX(-50%)` }} />
               ))}

               {/* Segment Content with precise organization */}
               {WHEEL_DATA.map((data, i) => (
                 <div 
                   key={i} 
                   className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom text-center pt-6"
                   style={{ 
                     transform: `rotate(${i * 45 + 22.5}deg)`,
                     width: '100px'
                   }}
                 >
                    <div className="flex flex-col items-center gap-1" style={{ color: data.textColor }}>
                      <b className="text-[13px] font-black uppercase tracking-tighter drop-shadow-lg leading-tight">{data.value}</b>
                      {data.isChance ? (
                        <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm mt-0.5">
                          <Star size={18} fill="currentColor" className="text-yellow-300 drop-shadow-md" />
                        </div>
                      ) : (
                        <div className="relative pt-1 scale-90">
                          <div className="flex flex-col items-center -space-y-4">
                             <Coins size={14} className="text-black/20 translate-x-1" />
                             <Coins size={18} className="text-yellow-900/40 translate-x-0.5" />
                             <Coins size={22} className="drop-shadow-xl" />
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
               ))}
            </motion.div>
          </div>

          {/* Hub Button: Epic GIRAR Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
             <button
               onClick={handleSpin}
               disabled={isSpinning}
               className={`w-28 h-28 rounded-full border-[5px] border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.5)] flex items-center justify-center transition-all active:scale-90 group relative ${
                 isSpinning ? 'grayscale bg-[#111]' : 'bg-linear-to-br from-purple-800 via-[#0A051E] to-blue-900'
               }`}
             >
                <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping opacity-20 pointer-events-none" />
                <div className="text-center relative z-10 px-4">
                   <div className="flex justify-center gap-1 mb-1.5">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_yellow]" />)}
                   </div>
                   <span className="text-lg font-black italic tracking-[0.1rem] text-[#D4AF37] drop-shadow-2xl">GIRAR</span>
                   <div className="flex justify-center gap-1 mt-1.5">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_yellow]" />)}
                   </div>
                </div>
             </button>
          </div>
        </div>
      </div>

      {/* Footer Info Area */}
      <div className="relative z-10 pb-12 px-6 flex flex-col gap-6 items-center">
        <div className="w-full max-w-sm flex gap-3">
          {/* Balance Display */}
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between">
            <div>
               <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mb-0.5">Ticket</p>
               <b className="text-lg font-serif text-accent leading-none">{tickets}</b>
            </div>
            <Ticket className="text-accent/50" size={16} />
          </div>

          {/* Recharge Button Option */}
          <button 
            onClick={onRecharge}
            className="flex-1 bg-accent/10 border border-accent/30 rounded-xl p-3 flex items-center justify-between hover:bg-accent/20 transition-all active:scale-95 group"
          >
             <div>
               <p className="text-[7px] font-black uppercase tracking-widest text-accent mb-0.5">Saldo</p>
               <b className="text-lg font-serif text-white leading-none">MZN {balance.toLocaleString()}</b>
             </div>
             <Coins className="text-accent group-hover:animate-bounce" size={16} />
          </button>
          
          {/* Exit Button */}
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Global Prize Bar */}
        <div className="w-full bg-[#1A1A3A] border-y border-white/5 py-4">
           <div className="flex items-center justify-center gap-4">
             <Star className="text-accent animate-spin-slow" size={14} />
             <p className="text-[9px] font-black uppercase tracking-[4px] text-white/60">Gire e ganhe prêmios incríveis!</p>
             <Star className="text-accent animate-spin-slow" size={14} />
           </div>
        </div>
      </div>
    </div>
  );
}
