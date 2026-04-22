import { Home, ClipboardList, ShieldCheck, Users, User, Bomb } from 'lucide-react';
import { motion } from 'motion/react';
import { Tab } from '../types';

interface NavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: 'home', label: 'Início', Icon: Home },
    { id: 'tasks', label: 'Tarefa', Icon: ClipboardList },
    { id: 'mines', label: 'Mines', Icon: Bomb },
    { id: 'vip', label: 'VIP', Icon: ShieldCheck },
    { id: 'team', label: 'Equipa', Icon: Users },
    { id: 'me', label: 'Perfil', Icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-4 z-50 backdrop-blur-md bg-surface/90">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`group flex flex-col items-center gap-1.5 transition-all relative ${
            activeTab === tab.id ? 'text-accent' : 'text-text-secondary'
          }`}
        >
          <tab.Icon size={18} className="group-hover:scale-110 transition-transform" />
          <span className={`text-[9px] uppercase tracking-widest font-bold ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <motion.div 
              layoutId="nav-active"
              className="absolute -bottom-4 w-10 h-[2px] bg-accent"
            />
          )}
        </button>
      ))}
    </nav>
  );
}
