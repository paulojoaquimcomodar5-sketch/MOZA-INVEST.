import { Users, UserPlus, Share2, Copy } from 'lucide-react';
import { User } from '../types';
import { useTranslation } from '../lib/i18n';

interface TeamStats {
  size: number;
  totalCommission: number;
  activeMembers: number;
  level1Count: number;
}

const stats: TeamStats = {
  size: 1,
  totalCommission: 250.00,
  activeMembers: 0,
  level1Count: 1,
};

interface TeamViewProps {
  user: User | null;
}

export default function TeamView({ user }: TeamViewProps) {
  const { t } = useTranslation();
  const inviteLink = `https://mozainv.app/register?invite=${user?.inviteCode || 'MOZA2026'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert(t('invite_link_copied'));
  };

  return (
    <div className="animate-fade px-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">{t('my_team')}</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border p-5 rounded-xl text-center">
          <div className="w-10 h-10 bg-accent-muted text-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <Users size={20} />
          </div>
          <small className="text-text-secondary uppercase text-[9px] tracking-widest block mb-1">{t('total_members')}</small>
          <b className="text-2xl text-white font-serif">{stats.size}</b>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl text-center">
          <div className="w-10 h-10 bg-accent-muted text-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus size={20} />
          </div>
          <small className="text-text-secondary uppercase text-[9px] tracking-widest block mb-1">{t('total_commission')}</small>
          <b className="text-2xl text-accent font-serif">{stats.totalCommission.toFixed(2)} MT</b>
        </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-xl mb-8">
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <Share2 size={18} className="text-accent" />
          {t('invite_friends')}
        </h4>
        <p className="text-text-secondary text-[11px] mb-4 leading-relaxed uppercase tracking-wider">
          {t('invite_desc')}
        </p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            readOnly 
            value={inviteLink}
            className="flex-1 bg-bg border border-border text-xs px-4 py-3 rounded text-text-secondary outline-none"
          />
          <button 
            onClick={copyToClipboard}
            className="bg-accent text-bg px-4 rounded hover:opacity-90 active:scale-95 transition-all"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[2px] text-text-secondary font-bold px-2 text-center">{t('commission_structure')}</p>
        <div className="bg-surface border border-border p-5 rounded-xl flex justify-between">
          <span className="text-text-secondary text-[11px] uppercase tracking-widest">{t('level1_direct')}</span>
          <b className="text-accent">10%</b>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl flex justify-between">
          <span className="text-text-secondary text-[11px] uppercase tracking-widest">{t('level2_indirect')}</span>
          <b className="text-accent">3%</b>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl flex justify-between">
          <span className="text-text-secondary text-[11px] uppercase tracking-widest">{t('level3_network')}</span>
          <b className="text-accent">2%</b>
        </div>
      </div>
    </div>
  );
}
