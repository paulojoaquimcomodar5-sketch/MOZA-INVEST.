import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Trophy, ChevronRight } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  image: string;
  desc: string;
}

const PRIZES: Prize[] = [
  { id: '1', name: 'Motorizada 150cc', image: 'https://picsum.photos/seed/motorcycle/1200/800', desc: 'Mota zero km para facilitar a sua mobilidade.' },
  { id: '2', name: 'Smart TV 55" 4K', image: 'https://picsum.photos/seed/television/1200/800', desc: 'Experiência de cinema no conforto da sua sala.' },
  { id: '3', name: 'iPhone 17 Pro', image: 'https://picsum.photos/seed/iphone/1200/800', desc: 'O smartphone mais avançado do mundo (Lançamento Exclusivo).' },
  { id: '4', name: 'BMW X5 LUX', image: 'https://picsum.photos/seed/bmw/1200/800', desc: 'O máximo em luxo, potência e sofisticação alemã.' },
  { id: '5', name: 'RACTS Premium', image: 'https://picsum.photos/seed/gold/1200/800', desc: 'Pacotes especiais de alocação e benefícios exclusivos.' },
];

export default function PrizeShowcase() {
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  return (
    <div className="mt-12 mb-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-serif italic text-xl flex items-center gap-2">
            <Trophy className="text-accent" size={20} />
            Vitrine de Prêmios
          </h3>
          <p className="text-accent text-[8px] uppercase tracking-widest font-black">Sorteios Exclusivos para Membros VIP</p>
        </div>
        <ChevronRight className="text-border" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PRIZES.map((prize) => (
          <button 
            key={prize.id}
            onClick={() => setSelectedPrize(prize)}
            className="bg-surface border border-border rounded-xl overflow-hidden group active:scale-95 transition-all text-left"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={prize.image} 
                alt={prize.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-bg/80 to-transparent"></div>
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[7px] uppercase tracking-[2px] font-black text-white/50 block mb-0.5">Prêmio Grande</span>
                <b className="text-white text-[10px] uppercase tracking-tighter block truncate">{prize.name}</b>
              </div>
            </div>
          </button>
        ))}
        <div className="bg-accent/5 border border-dashed border-accent/30 rounded-xl flex flex-col items-center justify-center p-4 text-center group active:scale-95 transition-all cursor-pointer">
          <Sparkles className="text-accent mb-2 animate-pulse" size={20} />
          <span className="text-accent text-[8px] uppercase font-black tracking-widest leading-tight">Mais prêmios em breve...</span>
        </div>
      </div>

      <AnimatePresence>
        {selectedPrize && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-bg/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-border rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl"
            >
              <div className="relative aspect-square">
                <img 
                  src={selectedPrize.image} 
                  alt={selectedPrize.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedPrize(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-bg/50 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent"></div>
              </div>
              
              <div className="p-8 text-center">
                <div className="w-12 h-1 bg-accent mx-auto mb-6"></div>
                <h4 className="text-white font-serif text-3xl mb-4 italic">{selectedPrize.name}</h4>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  {selectedPrize.desc}
                </p>
                <button 
                  onClick={() => setSelectedPrize(null)}
                  className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-xs uppercase tracking-[4px] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                  FECHAR VITRINE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
