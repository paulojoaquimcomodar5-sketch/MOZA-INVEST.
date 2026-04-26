import React, { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'pt' | 'en' | 'ny' | 'zu' | 'tsa';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Navigation
  home: {
    pt: 'Início',
    en: 'Home',
    ny: 'Kunyumba',
    zu: 'Ikhaya',
    tsa: 'Kaya'
  },
  tasks: {
    pt: 'Tarefas',
    en: 'Tasks',
    ny: 'Nchito',
    zu: 'Imisebenzi',
    tsa: 'Mintirho'
  },
  vip: {
    pt: 'VIP',
    en: 'VIP',
    ny: 'VIP',
    zu: 'VIP',
    tsa: 'VIP'
  },
  team: {
    pt: 'Equipe',
    en: 'Team',
    ny: 'Gulu',
    zu: 'Iqembu',
    tsa: 'Ntlawa'
  },
  me: {
    pt: 'Perfil',
    en: 'Profile',
    ny: 'Mbiri',
    zu: 'Iphrofayela',
    tsa: 'Phrofayili'
  },
  // Home View
  available_balance: {
    pt: 'Saldo Disponível',
    en: 'Available Balance',
    ny: 'Ndalama Zomwe Zilipo',
    zu: 'Ibhalansi Etholakalayo',
    tsa: 'Ntsengo lowu kumekaka'
  },
  vip_class: {
    pt: 'Classe VIP',
    en: 'VIP Class',
    ny: 'Gulu la VIP',
    zu: 'Isigaba se-VIP',
    tsa: 'Xiyimo xa VIP'
  },
  recharge: {
    pt: 'Recarga',
    en: 'Recharge',
    ny: 'Kuonjezera',
    zu: 'Faka imali',
    tsa: 'Ku nghenisa mali'
  },
  withdraw: {
    pt: 'Saque',
    en: 'Withdraw',
    ny: 'Kuchotsa',
    zu: 'Khipha imali',
    tsa: 'Ku humesa mali'
  },
  loan: {
    pt: 'Crédito',
    en: 'Loan',
    ny: 'Ngongole',
    zu: 'Imali mboleko',
    tsa: 'Xikweneti'
  },
  capital_plans: {
    pt: 'Planos de Capital',
    en: 'Capital Plans',
    ny: 'Mapulani a Ndalama',
    zu: 'Amapulani eMali',
    tsa: 'Mapulani ya mali'
  },
  // Auth
  login: {
    pt: 'Entrar na Conta',
    en: 'Login',
    ny: 'Lowani',
    zu: 'Ngena',
    tsa: 'Nghena'
  },
  register: {
    pt: 'Registe-se',
    en: 'Register',
    ny: 'Lembetsani',
    zu: 'Bhalisa',
    tsa: 'Titsalise'
  },
  phone_number: {
    pt: 'Telemóvel',
    en: 'Phone Number',
    ny: 'Nambala ya Foni',
    zu: 'Inombolo yocingo',
    tsa: 'Nomboro ya foni'
  },
  password: {
    pt: 'Palavra-passe',
    en: 'Password',
    ny: 'Chinsinsi',
    zu: 'Iphasiwedi',
    tsa: 'Rito-vuxaka'
  },
  invite_code: {
    pt: 'Código de Convite',
    en: 'Invite Code',
    ny: 'Khodi Yoitanira',
    zu: 'Ikhodi yesimemo',
    tsa: 'Khodi ya xirhambo'
  },
  // Common Actions
  confirm: {
    pt: 'Confirmar',
    en: 'Confirm',
    ny: 'Tsimikizani',
    zu: 'Qinisekisa',
    tsa: 'Tiyisisa'
  },
  cancel: {
    pt: 'Cancelar',
    en: 'Cancel',
    ny: 'Kulepheretsa',
    zu: 'Khansela',
    tsa: 'Tshika'
  },
  logout: {
    pt: 'Sair',
    en: 'Logout',
    ny: 'Tulukani',
    zu: 'Phuma',
    tsa: 'Huma'
  },
  // Settings/Profile
  settings: {
    pt: 'Definições',
    en: 'Settings',
    ny: 'Zokonda',
    zu: 'Izilungiselelo',
    tsa: 'Swiyimiso'
  },
  language: {
    pt: 'Idioma',
    en: 'Language',
    ny: 'Chilankhulo',
    zu: 'Ulimi',
    tsa: 'Ririmi'
  },
  support: {
    pt: 'Suporte',
    en: 'Support',
    ny: 'Chithandizo',
    zu: 'Ukwesekwa',
    tsa: 'Nseketelo'
  },
  exclusive_support: {
    pt: 'Suporte Exclusivo',
    en: 'Exclusive Support',
    ny: 'Chithandizo Chachilendo',
    zu: 'Ukwesekwa okukhethekile',
    tsa: 'Nseketelo lowu hlawulekeke'
  },
  professional_aid: {
    pt: 'Apoio Profissional 24/7',
    en: '24/7 Professional Aid',
    ny: 'Thandizo Lakatswiri 24/7',
    zu: 'Usizo lwezingcweti 24/7',
    tsa: 'Mpfuno wa xiphurofexinali 24/7'
  }
};

type ContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<ContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key]['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
