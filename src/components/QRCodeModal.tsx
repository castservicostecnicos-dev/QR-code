import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Wifi,
  Link2,
  MessageCircle,
  CreditCard,
  Contact,
  FileText,
  Palette,
  Settings,
  Sparkles,
  Building2,
  Check,
  Smartphone,
  Eye,
  Lock,
  Layers
} from 'lucide-react';
import type { QRCodeItem, QRCodeType, QRDesign, ClientUser, UserSession } from '../types';
import { generateQRDataUrl, generateRawWifiString } from '../utils/qrGenerator';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (qrData: Partial<QRCodeItem>) => Promise<void>;
  qrToEdit?: QRCodeItem | null;
  clients: ClientUser[];
  currentSession: UserSession;
}

const colorPresets = [
  { name: 'Clássico Preto', fg: '#000000', bg: '#ffffff', frame: '#000000' },
  { name: 'Índigo Moderno', fg: '#4338ca', bg: '#ffffff', frame: '#4f46e5' },
  { name: 'Café & Bistro', fg: '#78350f', bg: '#fffbeb', frame: '#92400e' },
  { name: 'Esmeralda', fg: '#065f46', bg: '#f0fdf4', frame: '#059669' },
  { name: 'Azul Corporativo', fg: '#0369a1', bg: '#f0f9ff', frame: '#0284c7' },
  { name: 'Vinho / Ruby', fg: '#9f1239', bg: '#fff1f2', frame: '#e11d48' },
  { name: 'Dark Mode', fg: '#f8fafc', bg: '#0f172a', frame: '#334155' },
];

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  qrToEdit,
  clients,
  currentSession,
}) => {
  const isDev = currentSession.role === 'dev';

  // Tabs: 'content' | 'design'
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  // Form State
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'dynamic' | 'static'>('dynamic');
  const [type, setType] = useState<QRCodeType>('wifi');
  const [clientId, setClientId] = useState<string>('dev');
  const [customShortCode, setCustomShortCode] = useState('');

  // Content state
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [securityType, setSecurityType] = useState<'WPA' | 'WEP' | 'nopass' | 'WPA3'>('WPA');
  const [welcomeNote, setWelcomeNote] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('cpf');
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [textContent, setTextContent] = useState('');

  // Design state
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [frame, setFrame] = useState<'none' | 'simple' | 'badge' | 'wifi' | 'scan_me' | 'cardapio'>('wifi');
  const [frameText, setFrameText] = useState('CONECTE AO WI-FI');
  const [frameColor, setFrameColor] = useState('#000000');
  const [cornerStyle, setCornerStyle] = useState<'square' | 'rounded'>('rounded');
  const [logoType, setLogoType] = useState<'none' | 'wifi' | 'link' | 'whatsapp' | 'store' | 'coffee'>('wifi');

  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialize form
  useEffect(() => {
    if (qrToEdit) {
      setTitle(qrToEdit.title || '');
      setMode(qrToEdit.mode || 'dynamic');
      setType(qrToEdit.type || 'wifi');
      setClientId(qrToEdit.clientId || 'dev');
      setCustomShortCode(qrToEdit.shortCode || '');

      const c = qrToEdit.content || {};
      setSsid(c.ssid || '');
      setPassword(c.password || '');
      setSecurityType(c.securityType || 'WPA');
      setWelcomeNote(c.welcomeNote || '');
      setTargetUrl(c.targetUrl || '');
      setPhoneNumber(c.phoneNumber || '');
      setDefaultMessage(c.defaultMessage || '');
      setPixKey(c.pixKey || '');
      setPixKeyType(c.pixKeyType || 'cpf');
      setMerchantName(c.merchantName || '');
      setAmount(c.amount || '');
      setFullName(c.fullName || '');
      setJobTitle(c.jobTitle || '');
      setContactEmail(c.email || '');
      setContactPhone(c.phone || '');
      setWebsite(c.website || '');
      setTextContent(c.text || '');

      const d = qrToEdit.design || {
        fgColor: '#000000',
        bgColor: '#ffffff',
        frame: 'wifi',
        frameText: 'CONECTE AO WI-FI',
        cornerStyle: 'rounded',
        logoType: 'wifi',
      };
      setFgColor(d.fgColor || '#000000');
      setBgColor(d.bgColor || '#ffffff');
      setFrame(d.frame || 'wifi');
      setFrameText(d.frameText || 'CONECTE AO WI-FI');
      setFrameColor(d.frameColor || d.fgColor || '#000000');
      setCornerStyle(d.cornerStyle || 'rounded');
      setLogoType(d.logoType || 'wifi');
    } else {
      // Default initial
      setTitle('Wi-Fi Clientes');
      setMode('dynamic');
      setType('wifi');
      setClientId(isDev ? (clients[0]?.id || 'dev') : currentSession.user.id);
      setCustomShortCode('');
      setSsid('MinhaRede_Wi-Fi');
      setPassword('senha123456');
      setSecurityType('WPA');
      setWelcomeNote('Seja bem-vindo! Aproveite nossa internet de alta velocidade.');
      setTargetUrl('https://');
      setPhoneNumber('');
      setDefaultMessage('');
      setPixKey('');
      setMerchantName('');
      setAmount('');
      setFullName('');
      setJobTitle('');
      setTextContent('');

      setFgColor('#0f172a');
      setBgColor('#ffffff');
      setFrame('wifi');
      setFrameText('WI-FI GRÁTIS AQUI');
      setFrameColor('#0f172a');
      setCornerStyle('rounded');
      setLogoType('wifi');
    }
    setError('');
    setActiveTab('content');
  }, [qrToEdit, isOpen, isDev]);

  // Update frame text defaults when changing type
  const handleTypeChange = (newType: QRCodeType) => {
    setType(newType);
    if (!qrToEdit) {
      if (newType === 'wifi') {
        setTitle('Wi-Fi Clientes');
        setFrame('wifi');
        setFrameText('CONECTE AO WI-FI');
        setLogoType('wifi');
      } else if (newType === 'url') {
        setTitle('Cardápio / Link Digital');
        setFrame('scan_me');
        setFrameText('ESCANEIE COM A CÂMERA');
        setLogoType('link');
      } else if (newType === 'whatsapp') {
        setTitle('Atendimento WhatsApp');
        setFrame('badge');
        setFrameText('FALE NO WHATSAPP');
        setLogoType('whatsapp');
        setFgColor('#059669');
        setFrameColor('#059669');
      } else if (newType === 'pix') {
        setTitle('Pagamento via Pix');
        setFrame('badge');
        setFrameText('PAGAMENTO PIX');
        setLogoType('store');
        setFgColor('#0d9488');
        setFrameColor('#0d9488');
      } else if (newType === 'vcard') {
        setTitle('Cartão de Visita Digital');
        setFrame('simple');
        setFrameText('SALVE MEU CONTATO');
        setLogoType('none');
      }
    }
  };

  // Generate live preview QR
  useEffect(() => {
    if (!isOpen) return;
    const testSlug = customShortCode.trim() || qrToEdit?.shortCode || 'exemplo-dinamico';
    let encodedData = `${window.location.origin}/q/${testSlug}`;

    if (mode === 'static') {
      if (type === 'url') {
        let clean = targetUrl.trim() || 'https://exemplo.com';
        if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;
        encodedData = clean;
      } else if (type === 'text') {
        encodedData = textContent.trim() || 'Texto permanente gravado no QR Code';
      } else if (type === 'wifi') {
        encodedData = generateRawWifiString(ssid || 'MinhaRede', password, securityType);
      } else if (type === 'whatsapp') {
        const rawNum = phoneNumber.replace(/\D/g, '') || '5511999999999';
        const msg = defaultMessage ? `?text=${encodeURIComponent(defaultMessage)}` : '';
        encodedData = `https://wa.me/${rawNum}${msg}`;
      } else if (type === 'pix') {
        encodedData = pixKey.trim() || 'chave-pix-permanente';
      } else if (type === 'vcard') {
        encodedData = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${fullName.trim() || 'Contato'}\r\nEND:VCARD`;
      }
    }

    const design: QRDesign = {
      fgColor,
      bgColor,
      frame,
      frameText,
      frameColor,
      cornerStyle,
      logoType,
    };

    generateQRDataUrl(encodedData, design, 400).then((url) => {
      setPreviewDataUrl(url);
    });
  }, [
    isOpen,
    mode,
    type,
    ssid,
    password,
    securityType,
    targetUrl,
    textContent,
    phoneNumber,
    defaultMessage,
    pixKey,
    fullName,
    fgColor,
    bgColor,
    frame,
    frameText,
    frameColor,
    cornerStyle,
    logoType,
    customShortCode,
    qrToEdit,
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe um título identificador.');
      return;
    }

    if (type === 'wifi' && !ssid.trim()) {
      setError('Por favor, informe o nome da rede Wi-Fi (SSID).');
      return;
    }

    if (type === 'url' && (!targetUrl.trim() || targetUrl === 'https://')) {
      setError('Por favor, informe a URL de destino.');
      return;
    }

    setSaving(true);
    try {
      let contentPayload: any = {};
      if (type === 'wifi') {
        contentPayload = {
          ssid: ssid.trim(),
          password: password.trim(),
          securityType,
          welcomeNote: welcomeNote.trim(),
        };
      } else if (type === 'url') {
        let clean = targetUrl.trim();
        if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;
        contentPayload = { targetUrl: clean };
      } else if (type === 'whatsapp') {
        contentPayload = {
          phoneNumber: phoneNumber.trim(),
          defaultMessage: defaultMessage.trim(),
        };
      } else if (type === 'pix') {
        contentPayload = {
          pixKey: pixKey.trim(),
          pixKeyType,
          merchantName: merchantName.trim(),
          amount: amount.trim(),
        };
      } else if (type === 'vcard') {
        contentPayload = {
          fullName: fullName.trim(),
          jobTitle: jobTitle.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          website: website.trim(),
        };
      } else if (type === 'text') {
        contentPayload = { text: textContent.trim() };
      }

      const designPayload: QRDesign = {
        fgColor,
        bgColor,
        frame,
        frameText: frameText.trim(),
        frameColor,
        cornerStyle,
        logoType,
      };

      let rawStaticData = '';
      if (mode === 'static') {
        if (type === 'url') {
          let clean = targetUrl.trim();
          if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;
          rawStaticData = clean;
        } else if (type === 'text') {
          rawStaticData = textContent.trim();
        } else if (type === 'wifi') {
          rawStaticData = generateRawWifiString(ssid.trim(), password.trim(), securityType);
        } else if (type === 'whatsapp') {
          const rawNum = phoneNumber.replace(/\D/g, '');
          const msg = defaultMessage ? `?text=${encodeURIComponent(defaultMessage)}` : '';
          rawStaticData = `https://wa.me/${rawNum}${msg}`;
        } else if (type === 'pix') {
          rawStaticData = pixKey.trim();
        }
      }

      await onSave({
        title: title.trim(),
        type,
        mode,
        rawStaticData: mode === 'static' ? rawStaticData : undefined,
        clientId: isDev ? clientId : currentSession.user.id,
        customShortCode: customShortCode.trim(),
        content: contentPayload,
        design: designPayload,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar o QR Code.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base">
                  {qrToEdit ? 'Editar QR Code' : 'Criar Novo QR Code'}
                </h2>
                {mode === 'static' ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Estático (Permanente)
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Dinâmico (Reutilizável)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                O link permanente permite editar destinos e senhas a qualquer momento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>1. Destino & Conteúdo</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'design'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>2. Design & Moldura</span>
          </button>
        </div>

        {/* Content Body: Split layout with Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 cols */}
          <form id="qr-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {activeTab === 'content' ? (
              <>
                {/* Mode Selector: Dynamic vs Static */}
                <div className="bg-slate-100/90 p-2 rounded-2xl border border-slate-200/80">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                    Tipo de Funcionamento do QR Code
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={!!qrToEdit}
                      onClick={() => setMode('dynamic')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-start ${
                        mode === 'dynamic'
                          ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200 ring-2 ring-indigo-500/20'
                          : 'text-slate-600 hover:text-slate-900 bg-slate-50/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>QR Code Dinâmico</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                          Reutilizável
                        </span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-500 text-left mt-0.5">
                        Destino e senha editáveis remotamente a qualquer momento.
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={!!qrToEdit}
                      onClick={() => setMode('static')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-start ${
                        mode === 'static'
                          ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                          : 'text-slate-600 hover:text-slate-900 bg-slate-50/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Lock className={`w-3.5 h-3.5 ${mode === 'static' ? 'text-amber-200' : 'text-amber-600'}`} />
                        <span>QR Code Estático</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          mode === 'static' ? 'bg-amber-800 text-amber-100' : 'bg-slate-200 text-slate-700'
                        }`}>
                          Permanente / Fixo
                        </span>
                      </div>
                      <span className={`text-[11px] font-normal text-left mt-0.5 ${
                        mode === 'static' ? 'text-amber-100' : 'text-slate-500'
                      }`}>
                        Destino gravado para sempre. Não é editável após a criação.
                      </span>
                    </button>
                  </div>

                  {mode === 'static' ? (
                    <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <strong>Modo Estático:</strong> O link ou texto digitado será gravado permanentemente no QR Code. <em>Atenção: este QR code não poderá ser editado após a geração.</em>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título de Identificação *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Wi-Fi Clientes Café"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Dev Master: select client owner */}
                  {isDev ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Vincular ao Cliente / Estabelecimento</span>
                      </label>
                      <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      >
                        <option value="dev">Dev Master (Uso Próprio)</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company || c.name} ({c.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Código Curto (Opcional)
                      </label>
                      <input
                        type="text"
                        value={customShortCode}
                        onChange={(e) => setCustomShortCode(e.target.value)}
                        placeholder="Ex: wifi-balcao"
                        className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* QR Code Type Selector Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Tipo do QR Code Dinâmico
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('wifi')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === 'wifi'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Wifi className="w-5 h-5 mb-1 text-indigo-600" />
                      <span>Wi-Fi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange('url')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === 'url'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Link2 className="w-5 h-5 mb-1 text-blue-600" />
                      <span>Link / URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange('whatsapp')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === 'whatsapp'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 mb-1 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange('pix')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === 'pix'
                          ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm ring-1 ring-teal-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mb-1 text-teal-600" />
                      <span>Pix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange('vcard')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === 'vcard'
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm ring-1 ring-purple-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Contact className="w-5 h-5 mb-1 text-purple-600" />
                      <span>Contato</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange('text')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === 'text'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm ring-1 ring-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-5 h-5 mb-1 text-amber-600" />
                      <span>Texto</span>
                    </button>
                  </div>
                </div>

                {/* Specific form fields per type */}
                {type === 'wifi' && (
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                      <Wifi className="w-4 h-4 text-indigo-600" />
                      <span>Configurações da Rede Wi-Fi Remota</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nome da Rede Wi-Fi (SSID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={ssid}
                          onChange={(e) => setSsid(e.target.value)}
                          placeholder="Ex: MinhaLoja_Clientes"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Senha do Wi-Fi
                        </label>
                        <input
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Ex: cafe2026! (ou vazia para rede aberta)"
                          className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Criptografia / Segurança
                        </label>
                        <select
                          value={securityType}
                          onChange={(e: any) => setSecurityType(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                        >
                          <option value="WPA">WPA / WPA2 (Mais comum)</option>
                          <option value="WPA3">WPA3 (Nova geração)</option>
                          <option value="WEP">WEP (Antigo)</option>
                          <option value="nopass">Rede Aberta (Sem senha)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mensagem de Boas-vindas (Opcional)
                        </label>
                        <input
                          type="text"
                          value={welcomeNote}
                          onChange={(e) => setWelcomeNote(e.target.value)}
                          placeholder="Ex: Aproveite nosso Wi-Fi de alta velocidade!"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {type === 'url' && (
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link / URL de Destino *
                    </label>
                    <input
                      type="text"
                      required
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://exemplo.com/cardapio-digital"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      Pode ser qualquer link: Cardápio, Site, Linktree, Google Drive, Catálogo, etc.
                    </p>
                  </div>
                )}

                {type === 'whatsapp' && (
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Número de WhatsApp (com DDD) *
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ex: 5511987654321"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mensagem Pré-definida (Opcional)
                      </label>
                      <input
                        type="text"
                        value={defaultMessage}
                        onChange={(e) => setDefaultMessage(e.target.value)}
                        placeholder="Ex: Olá! Vim pelo QR Code e gostaria de tirar uma dúvida."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {type === 'pix' && (
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Chave Pix *
                        </label>
                        <input
                          type="text"
                          required
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder="CPF, CNPJ, E-mail ou Celular"
                          className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nome do Beneficiário
                        </label>
                        <input
                          type="text"
                          value={merchantName}
                          onChange={(e) => setMerchantName(e.target.value)}
                          placeholder="Ex: João da Silva / Nome Fantasia"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Valor Sugerido em R$ (Opcional)
                      </label>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Deixe vazio para o pagador digitar o valor"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {type === 'vcard' && (
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: Dra. Ana Paula"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cargo / Especialidade
                        </label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="Ex: Cirurgiã Dentista"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Telefone / Celular
                        </label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="(11) 98765-4321"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="contato@clinica.com.br"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {type === 'text' && (
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Texto ou Comunicado
                    </label>
                    <textarea
                      rows={3}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Digite o texto que será exibido ao escanear..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </>
            ) : (
              /* Tab 2: Design & Estilo */
              <div className="space-y-4">
                {/* Palette Presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Paletas Rápidas
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {colorPresets.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setFgColor(p.fg);
                          setBgColor(p.bg);
                          setFrameColor(p.frame);
                        }}
                        className="flex items-center space-x-2 p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 text-left transition-colors"
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-slate-300 shadow-sm shrink-0"
                          style={{ backgroundColor: p.fg }}
                        />
                        <span className="text-[11px] font-medium text-slate-700 truncate">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cor do QR Code
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cor do Fundo
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cor da Moldura
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Frame Style Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Modelo de Moldura / Placa
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'wifi', label: 'Wi-Fi em Destaque' },
                      { id: 'scan_me', label: 'Escaneie Aqui' },
                      { id: 'cardapio', label: 'Cardápio / Menu' },
                      { id: 'badge', label: 'Emblema Superior' },
                      { id: 'simple', label: 'Moldura Minimalista' },
                      { id: 'none', label: 'Sem Moldura' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrame(f.id as any)}
                        className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-colors ${
                          frame === f.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Text */}
                {frame !== 'none' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Texto da Moldura
                    </label>
                    <input
                      type="text"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="Ex: WI-FI GRÁTIS AQUI"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg uppercase tracking-wider font-bold"
                    />
                  </div>
                )}

                {/* Corner style & Logo icon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estilo dos Cantos
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setCornerStyle('rounded')}
                        className={`flex-1 py-2 text-xs rounded-lg border font-medium ${
                          cornerStyle === 'rounded'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        Arredondado
                      </button>
                      <button
                        type="button"
                        onClick={() => setCornerStyle('square')}
                        className={`flex-1 py-2 text-xs rounded-lg border font-medium ${
                          cornerStyle === 'square'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        Quadrado
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ícone Central
                    </label>
                    <select
                      value={logoType}
                      onChange={(e: any) => setLogoType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="none">Nenhum</option>
                      <option value="wifi">Símbolo Wi-Fi</option>
                      <option value="coffee">Café / Bistrô</option>
                      <option value="store">Loja / Balcão</option>
                      <option value="link">Link Web</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Right Live Preview: 5 cols */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 flex flex-col items-center justify-between shadow-inner">
            <div className="w-full text-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pré-Visualização do Material Impresso
              </span>
              <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">
                {title || 'Título do QR Code'}
              </h4>
            </div>

            {/* QR Card Mockup with Frame */}
            <div
              className={`p-4 rounded-2xl shadow-xl flex flex-col items-center transition-all ${
                cornerStyle === 'rounded' ? 'rounded-2xl' : 'rounded-none'
              }`}
              style={{
                backgroundColor: bgColor,
                border: frame !== 'none' ? `3px solid ${frameColor}` : '1px solid #e2e8f0',
                maxWidth: '260px',
                width: '100%',
              }}
            >
              {/* Top Frame Banner */}
              {frame !== 'none' && frameText && (
                <div
                  className="w-full py-1.5 px-2 rounded-lg text-center text-xs font-black tracking-wider uppercase mb-2 shadow-sm text-white"
                  style={{ backgroundColor: frameColor }}
                >
                  {frameText}
                </div>
              )}

              {/* QR Image with optional center badge */}
              <div className="relative">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Preview QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs">
                    Carregando QR...
                  </div>
                )}

                {/* Optional Center Icon */}
                {logoType !== 'none' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center">
                      {logoType === 'wifi' && <Wifi className="w-4 h-4 text-indigo-600" />}
                      {logoType === 'coffee' && <span className="text-sm">☕</span>}
                      {logoType === 'store' && <Building2 className="w-4 h-4 text-slate-700" />}
                      {logoType === 'link' && <Link2 className="w-4 h-4 text-blue-600" />}
                      {logoType === 'whatsapp' && <MessageCircle className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Details / Hint */}
              <div className="w-full mt-2 pt-2 border-t border-slate-100 text-center">
                {type === 'wifi' && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold">Rede:</span> {ssid || 'SuaRede'}
                  </div>
                )}
                {mode === 'static' ? (
                  <div className="text-[10px] text-amber-700 font-bold mt-0.5 flex items-center justify-center space-x-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Destino Permanente (Não Editável)</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    /q/{customShortCode.trim() || qrToEdit?.shortCode || 'dinamico'}
                  </div>
                )}
              </div>
            </div>

            {mode === 'static' ? (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center w-full">
                <p className="text-[11px] text-amber-900 leading-tight">
                  🔒 <strong>QR Code Estático:</strong> O destino fica gravado permanentemente na imagem. Não requer servidor para redirecionar, mas <em>não poderá ser editado após a geração</em>.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center w-full">
                <p className="text-[11px] text-indigo-900 leading-tight">
                  💡 <strong>QR Code Dinâmico:</strong> Uma vez impresso em placas ou papéis, você poderá alterar a senha do Wi-Fi ou trocar o link aqui a qualquer momento sem reimprimir!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {activeTab === 'content' ? (
              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Próximo: Personalizar Design →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                ← Voltar para Conteúdo
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              form="qr-form"
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : qrToEdit ? 'Atualizar QR Code' : 'Criar QR Code Dinâmico'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
