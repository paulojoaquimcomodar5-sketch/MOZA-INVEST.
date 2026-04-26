import { User, Wallet, History, Shield, Settings, ChevronRight, LogOut, Building2, Camera, X, Check, Upload, Languages } from 'lucide-react';
import { Tab, User as UserType } from '../types';
import React, { useState, useRef, useEffect } from 'react';
import socket from '../lib/socket';
import { useTranslation, Language } from '../lib/i18n';

interface ProfileViewProps {
  user: UserType | null;
  onLogout: () => void;
  onWithdraw: () => void;
  onNavigate: (tab: Tab) => void;
}

export default function ProfileView({ user, onLogout, onWithdraw, onNavigate }: ProfileViewProps) {
  const { t, language, setLanguage } = useTranslation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState(user?.profileImage || '');
  const [newName, setNewName] = useState(user?.name || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages: { code: Language, label: string }[] = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'ts', label: 'Changana' },
    { code: 'nyu', label: 'Nhungue' },
    { code: 'ny', label: 'Chichewa' },
    { code: 'vmw', label: 'Macua' }
  ];

  // Sync state with user data when not editing
  useEffect(() => {
    if (!isEditingProfile) {
      setNewPhotoUrl(user?.profileImage || '');
      setNewName(user?.name || '');
    }
  }, [user, isEditingProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. O limite é 2MB.");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { id: 'reports', label: 'Relatórios de Lucro', Icon: History },
    { id: 'history', label: 'Histórico de Saques', Icon: Wallet },
    { id: 'security', label: 'Segurança da Conta', Icon: Shield },
    { id: 'company', label: 'Sobre a Empresa', Icon: Building2 },
    { id: 'settings', label: t('settings'), Icon: Settings },
  ] as const;

  const handleUpdateProfile = () => {
    if (user) {
      socket.emit("update_profile_image", { phone: user.phone, imageUrl: newPhotoUrl });
      socket.emit("update_profile_name", { phone: user.phone, name: newName });
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="animate-fade px-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">{t('me')}</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
        
        <div className="relative inline-block group mb-4">
          <div 
            onClick={() => setIsEditingProfile(true)}
            className="w-24 h-24 bg-bg border-4 border-surface rounded-full flex items-center justify-center mx-auto overflow-hidden shadow-xl ring-2 ring-accent/20 cursor-pointer hover:ring-accent transition-all relative"
          >
            {(isEditingProfile ? newPhotoUrl : user?.profileImage) ? (
              <img src={isEditingProfile ? newPhotoUrl : user?.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-accent" size={48} />
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="absolute bottom-0 right-0 p-2 bg-accent text-bg rounded-full shadow-lg border-2 border-surface active:scale-95 transition-all"
          >
            <Camera size={14} />
          </button>
        </div>

        {isEditingProfile && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-3 max-w-xs mx-auto text-left">
              <div>
                <label className="text-[8px] uppercase font-black text-text-secondary tracking-widest ml-1 mb-1 block">Nome Completo</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Seu Nome"
                  className="w-full bg-bg border border-border p-3 rounded-lg text-xs text-white outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[8px] uppercase font-black text-text-secondary tracking-widest ml-1 mb-1 block">Foto de Perfil</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="URL da imagem..."
                      className="w-full bg-bg border border-border p-3 pr-10 rounded-lg text-[9px] text-white outline-none focus:border-accent font-mono"
                    />
                    {newPhotoUrl && (
                      <button 
                        onClick={() => setNewPhotoUrl('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-bg border border-border p-3 rounded-lg flex items-center justify-center text-accent hover:border-accent group transition-all"
                    title="Carregar arquivo"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-[7px] text-text-secondary mt-1 ml-1 uppercase">URL direta ou carregar ficheiro (Max 2MB)</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setNewPhotoUrl(user?.profileImage || '');
                    setNewName(user?.name || '');
                  }}
                  className="flex-1 py-2 bg-surface text-[10px] font-black uppercase tracking-widest text-text-secondary rounded-lg border border-border"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  className="flex-1 py-2 bg-accent text-bg text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1"
                >
                  <Check size={14} /> Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-white text-xl font-serif">{isEditingProfile ? newName : user?.name || user?.phone}</h4>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-px w-4 bg-accent/30"></span>
            <p className="text-accent text-[10px] uppercase tracking-[3px] font-bold">{user?.level}</p>
            <span className="h-px w-4 bg-accent/30"></span>
          </div>
          {!isEditingProfile && (
            <p className="text-text-secondary text-[9px] mt-2 font-mono opacity-60 tracking-wider font-bold">{user?.phone}</p>
          )}
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 flex justify-between items-center mb-8">
        <div>
          <small className="text-text-secondary uppercase text-[9px] tracking-widest block mb-1">{t('available_balance')}</small>
          <div className="text-2xl font-serif text-white">MZN {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <button 
          onClick={onWithdraw}
          className="bg-accent text-bg font-bold py-2 px-6 rounded text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
        >
          SACAR
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-surface border border-border p-5 rounded-xl text-center">
          <small className="text-text-secondary uppercase text-[8px] tracking-[2px] block mb-1 font-bold">Total Lucro</small>
          <div className="text-lg font-serif text-white">450.00 MT</div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl text-center">
          <small className="text-text-secondary uppercase text-[8px] tracking-[2px] block mb-1 font-bold">Pontos Sorte</small>
          <div className="text-lg font-serif text-accent">{user?.tickets || 0} PTS</div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
            <Languages size={16} />
          </div>
          <h4 className="text-white text-[10px] uppercase tracking-widest font-bold">{t('select_language')}</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border ${
                language === lang.code 
                  ? 'bg-accent text-bg border-accent' 
                  : 'bg-bg text-text-secondary border-divider hover:border-accent/40'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-10">
        {menuItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => onNavigate(item.id)}
            className="w-full bg-surface border border-border p-5 rounded-xl flex items-center justify-between group hover:border-accent/40 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-accent">
                <item.Icon size={18} />
              </div>
              <span className="text-text-secondary text-xs uppercase tracking-widest font-bold group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
            <ChevronRight size={18} className="text-border group-hover:text-accent transition-colors" />
          </button>
        ))}

        <button 
          onClick={onLogout}
          className="w-full bg-red-500/10 border border-red-500/20 p-5 rounded-xl flex items-center justify-between group hover:bg-red-500/20 active:scale-95 transition-all mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-red-500">
              <LogOut size={18} />
            </div>
            <span className="text-red-500 text-xs uppercase tracking-widest font-bold">
              {t('logout')}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
