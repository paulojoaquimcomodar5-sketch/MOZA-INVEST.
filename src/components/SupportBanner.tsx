import { Headset, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../lib/i18n';

export default function SupportBanner() {
  const { t } = useTranslation();
  const openWhatsApp = () => {
    window.open('https://whatsapp.com/channel/0029VbBprjsEquiVZjdESc2L', '_blank');
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={openWhatsApp}
      className="w-full mb-6 bg-linear-to-r from-accent to-accent/80 p-[1px] rounded-2xl group overflow-hidden shadow-xl shadow-accent/10 active:scale-[0.98] transition-all"
    >
      <div className="bg-surface rounded-[15px] p-5 flex items-center justify-between relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-4 -right-4 opacity-5 group-hover:rotate-12 transition-transform">
          <Headset size={100} />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent ring-1 ring-accent/20">
            <Headset size={28} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-accent uppercase tracking-[2px]">{t('exclusive_support')}</span>
            </div>
            <h4 className="text-white text-lg font-serif">{t('professional_aid')}</h4>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">MOZ INV. disponível agora</p>
          </div>
        </div>

        <div className="bg-accent/10 p-3 rounded-xl text-accent relative z-10 group-hover:bg-accent group-hover:text-bg transition-colors">
          <ArrowUpRight size={20} />
        </div>
      </div>
    </motion.button>
  );
}
