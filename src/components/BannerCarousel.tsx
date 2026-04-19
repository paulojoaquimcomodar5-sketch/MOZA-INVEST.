import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../lib/socket';

interface Banner {
  id: string | number;
  text: string;
  sub: string;
  color: string;
  textColor: string;
  imageUrl?: string;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    socket.emit('get_banners');
    socket.on('banners_list', (list: Banner[]) => {
      setBanners(list);
    });
    return () => {
      socket.off('banners_list');
    };
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border shadow-2xl mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[index].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 overflow-hidden"
          style={{ background: banners[index].color }}
        >
          {banners[index].imageUrl && (
            <img 
              src={banners[index].imageUrl} 
              alt="Banner" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-[2000ms]" 
            />
          )}
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_70%)]"></div>
          
          <p className="text-[10px] uppercase tracking-[4px] text-accent/60 mb-3 font-bold select-none flex items-center gap-2">
            <span className="w-8 h-[1px] bg-accent/30"></span>
            Comunicado Premium
            <span className="w-8 h-[1px] bg-accent/30"></span>
          </p>
          
          <h2 className="text-2xl font-serif font-bold mb-2 tracking-tight leading-none" style={{ color: banners[index].textColor }}>
            {banners[index].text}
          </h2>
          
          <p className="max-w-[200px] mx-auto text-[11px] text-text-secondary italic leading-relaxed opacity-90 select-none">
            {banners[index].sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
        {banners.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${
              index === i ? 'w-6 bg-accent' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
