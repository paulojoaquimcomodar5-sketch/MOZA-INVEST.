import React, { useState } from 'react';
import { Building2, ShieldCheck, Globe, Award, Mail, Phone, MessageCircle, Headset, ArrowUpRight, Send, Youtube } from 'lucide-react';
import { Tab } from '../types';
import SupportBanner from './SupportBanner';
import { useTranslation } from '../lib/i18n';

interface CompanyViewProps {
  paymentMethods?: {
    mpesa: string;
    emola: string;
    paypal: string;
  };
}

export default function CompanyView(props: CompanyViewProps) {
  const { paymentMethods } = props;
  const { t } = useTranslation();
  return (
    <div className="animate-fade px-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">Sobre a MOZA INV</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <div className="relative mb-8 rounded-2xl overflow-hidden aspect-video border border-border">
        <img 
          src="https://picsum.photos/seed/luxury-office/800/450" 
          alt="Sede MOZA" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6">
          <div className="bg-accent text-bg font-black text-[9px] px-3 py-1 rounded-sm uppercase tracking-widest mb-2 inline-block shadow-lg">EST. 2018</div>
          <h4 className="text-white text-2xl font-serif">Inovação e Prestígio</h4>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <p className="text-text-secondary text-xs leading-relaxed uppercase tracking-wider mb-6">
          A <span className="text-white font-bold">MOZA INVESTIMENTOS</span> é uma plataforma líder dedicada à democratização de ativos premium em Moçambique. O nosso compromisso é com a transparência, transparência e segurança absoluta do capital dos nossos clientes.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg p-4 rounded-lg border border-border text-center">
            <ShieldCheck size={20} className="text-accent mx-auto mb-2" />
            <b className="text-white text-[10px] uppercase tracking-widest block">Segurança</b>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border text-center">
            <Globe size={20} className="text-accent mx-auto mb-2" />
            <b className="text-white text-[10px] uppercase tracking-widest block">Alcance</b>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <div className="flex items-start gap-4 p-4 border border-border rounded-xl bg-surface/50">
          <Award className="text-accent shrink-0" size={24} />
          <div>
            <b className="text-white text-sm block mb-1">Licença Financeira Ativa</b>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-loose">
              Operamos sob as mais rigorosas normas de conformidade financeira, garantindo que o seu lucro seja legítimo e segurado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SupportViewProps {
  onNavigate?: (tab: Tab) => void;
  paymentMethods?: {
    mpesa: string;
    emola: string;
    paypal: string;
  };
}

export function SupportView(props: SupportViewProps) {
  const { onNavigate, paymentMethods } = props;
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = () => {
    if (!email || !message) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      alert("Mensagem enviada com sucesso! O Centro de Apoio entrará em contacto brevemente.");
      setEmail('');
      setMessage('');
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="animate-fade px-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-serif italic text-2xl">{t('support')}</h3>
        <div className="h-px bg-border flex-1 ml-6 opacity-50"></div>
      </div>

      <SupportBanner />

      {/* Main Support Action: COMMUNITY CHAT */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <button 
          onClick={() => onNavigate?.('chat')}
          className="bg-linear-to-r from-accent to-accent-muted p-[1px] rounded-xl group active:scale-95 transition-all"
        >
          <div className="bg-surface rounded-[11px] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                <MessageCircle size={28} />
              </div>
              <div className="text-left">
                <b className="text-white block text-lg font-serif">Chat da Família</b>
                <span className="text-accent text-[9px] font-black uppercase tracking-[2px]">Admin e COMUNIDADE Online</span>
              </div>
            </div>
            <ArrowUpRight size={24} className="text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </button>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 text-center mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
          <Headset size={100} />
        </div>
        <h4 className="text-white text-xl font-serif mb-2">Como podemos ajudar?</h4>
        <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">Estamos disponíveis 24/7 para suporte exclusivo.</p>
      </div>

      {/* NEW SUPPORT FORM */}
      {/* NEW SOCIAL CHANNELS SECTION */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-500/10 rounded-lg">
                <Youtube className="text-red-500" size={20} />
             </div>
             <h4 className="text-white font-serif italic text-lg">Canal Oficial</h4>
          </div>
          <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-widest">YouTube</span>
        </div>
        
        <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest mb-6 leading-relaxed">
          Inscreva-se no canal oficial <span className="text-white">MOZA INVEST</span> para receber dicas exclusivas, tutoriais e novidades em tempo real.
        </p>

        <a 
          href="https://youtube.com/@mozainvest?si=IfrC6kDU3CzeMR6y" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg shadow-red-600/20 hover:bg-red-500 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Youtube size={16} />
          INSCREVER-SE NO CANAL
        </a>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Mail className="text-accent" size={20} />
          </div>
          <h4 className="text-white font-serif italic text-lg">Contacte-nos por Email</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2 ml-1">Seu E-mail para Contacto</label>
            <input 
              type="email" 
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full bg-bg border border-border p-4 rounded-xl text-white text-xs outline-none focus:border-accent transition-colors shadow-inner"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase font-black text-text-secondary tracking-[2px] block mb-2 ml-1">Assunto ou Mensagem</label>
            <textarea 
              value={message || ''}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Como podemos ajudar você hoje?"
              rows={3}
              className="w-full bg-bg border border-border p-4 rounded-xl text-white text-xs outline-none focus:border-accent transition-colors shadow-inner resize-none"
            />
          </div>
          
          <button 
            onClick={handleSendMessage}
            disabled={isSending}
            className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-[10px] uppercase tracking-[3px] shadow-lg shadow-accent/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isSending ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-bg border-t-transparent" />
            ) : (
              <>
                <Send size={16} />
                ENVIAR MENSAGEM DE SUPORTE
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        {[
          { 
            label: 'Centro de Apoio', 
            info: 'Canal Oficial WhatsApp', 
            Icon: MessageCircle, 
            color: 'text-emerald-400',
            action: () => window.open('https://whatsapp.com/channel/0029VbBprjsEquiVZjdESc2L', '_blank')
          },
          { label: 'M-Pesa (Recarga)', info: props.paymentMethods?.mpesa || 'Aguardando...', Icon: Phone, color: 'text-accent' },
          { label: 'e-Mola (Recarga)', info: props.paymentMethods?.emola || 'Aguardando...', Icon: Phone, color: 'text-accent' },
          { label: 'Suporte Técnico', info: 'suporte@mozainv.app', Icon: Mail, color: 'text-blue-400' },
        ].map((contact) => (
          <button 
            key={contact.label} 
            onClick={() => 'action' in contact ? (contact.action as () => void)() : null}
            className={`bg-surface border border-border p-6 rounded-xl flex items-center justify-between group transition-all ${'action' in contact ? 'hover:border-accent/40 active:scale-95 cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 bg-bg rounded-lg flex items-center justify-center ${contact.color}`}>
                <contact.Icon size={24} />
              </div>
              <div>
                <small className="text-text-secondary uppercase text-[8px] tracking-[2px] font-bold block mb-1">{contact.label}</small>
                <b className="text-white font-serif">{contact.info}</b>
              </div>
            </div>
            {'action' in contact && <ArrowUpRight size={18} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border p-6 rounded-xl text-center">
        <p className="text-text-secondary text-[10px] uppercase tracking-[3px] font-black mb-4">Perguntas Frequentes (FAQ)</p>
        <button className="text-accent text-[11px] font-bold uppercase tracking-widest hover:underline">
          Aceder à nossa Central de Ajuda
        </button>
      </div>
    </div>
  );
}
