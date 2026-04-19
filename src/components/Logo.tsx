import { TrendingUp } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 16, text: 'text-lg' },
    md: { icon: 24, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-4xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 justify-center ${className}`}>
      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-tr from-blue-500 via-emerald-400 to-accent rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative p-2 bg-surface rounded-lg border border-border shadow-2xl flex items-center justify-center">
          <TrendingUp className="text-accent" size={icon} />
        </div>
      </div>
      <div className={`${text} font-serif font-bold italic uppercase tracking-widest flex flex-col items-start leading-none`}>
        <span className="text-white">MOZA</span>
        <span className="text-accent text-[0.6em] tracking-[0.3em] font-sans font-black">INVESTIMENTOS</span>
      </div>
    </div>
  );
}
