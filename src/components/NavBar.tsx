import { Home, ClipboardList, ShieldCheck, Users, User, Bomb } from 'lucide-react';
import { motion } from 'motion/react';
import { Tab } from '../types';
import { useTranslation } from '../lib/i18n';

interface NavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const { t } = useTranslation();
  
  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: 'home', label: t('home'), Icon: Home },
    { id: 'tasks', label: t('tasks'), Icon: ClipboardList },
    { id: 'mines', label: t('mines'), Icon: Bomb },
    { id: 'vip', label: t('vip'), Icon: ShieldCheck },
    { id: 'team', label: t('team'), Icon: Users },
    { id: 'me', label: t('me'), Icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-3 px-2 z-50 backdrop-blur-xl bg-surface/80">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group flex flex-col items-center gap-1 min-w-[56px] py-2 transition-colors relative ${
              isActive ? 'text-accent' : 'text-text-secondary hover:text-white/60'
            }`}
          >
            {/* Background Highlight */}
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-accent/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <motion.div
              animate={{ 
                scale: isActive ? 1.2 : 1,
                y: isActive ? -2 : 0
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative z-10"
            >
              <tab.Icon size={18} />
            </motion.div>
            
            <span className={`text-[8px] uppercase tracking-tighter font-black relative z-10 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {tab.label}
            </span>

            {/* Indicator Dot */}
            {isActive && (
              <motion.div 
                layoutId="nav-active-dot"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
