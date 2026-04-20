import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 6000); // Extended to 6s for better reading
    return () => clearInterval(timer);
  }, [banners, index]);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border shadow-2xl mb-8 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[index].id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 overflow-hidden"
          style={{ background: banners[index].color }}
        >
          {banners[index].imageUrl && (
            <img 
              src={banners[index].imageUrl} 
              alt="Banner" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-[2000ms]" 
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

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-bg shadow-lg z-20"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-bg shadow-lg z-20"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 z-20">
        {banners.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
              index === i ? 'w-6 bg-accent' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
