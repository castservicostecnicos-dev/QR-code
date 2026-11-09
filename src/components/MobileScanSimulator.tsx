import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  MessageCircle,
  CreditCard,
  Contact,
  FileText,
  Lock,
  ChevronDown,
  Sparkles,
  QrCode
} from 'lucide-react';
import type { QRCodeItem } from '../types';
import { generateQRDataUrl, generateRawWifiString } from '../utils/qrGenerator';
import { downloadVCard } from '../utils/vcard';

interface MobileScanSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  qrcodes: QRCodeItem[];
  initialShortCode?: string;
}

export const MobileScanSimulator: React.FC<MobileScanSimulatorProps> = ({
  isOpen,
  onClose,
  qrcodes,
  initialShortCode,
}) => {
  const [selectedShortCode, setSelectedShortCode] = useState<string>('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [showDirectWifiQR, setShowDirectWifiQR] = useState(false);
  const [directWifiDataUrl, setDirectWifiDataUrl] = useState('');

  useEffect(() => {
    if (initialShortCode) {
      setSelectedShortCode(initialShortCode);
    } else if (qrcodes.length > 0 && !selectedShortCode) {
      setSelectedShortCode(qrcodes[0].shortCode);
    }
  }, [initialShortCode, qrcodes, isOpen]);

  const currentQR = qrcodes.find(
    (q) => q.shortCode.toLowerCase() === (selectedShortCode || '').toLowerCase()
  ) || qrcodes[0];

  useEffect(() => {
    if (currentQR?.type === 'wifi' && currentQR.content?.ssid) {
      const rawWifi = generateRawWifiString(
        currentQR.content.ssid,
        currentQR.content.password || '',
        currentQR.content.securityType || 'WPA'
      );
      generateQRDataUrl(rawWifi, {
        fgColor: '#000000',
        bgColor: '#ffffff',
        frame: 'none',
      }, 400).then((url) => {
        setDirectWifiDataUrl(url);
      });
    }
  }, [currentQR]);

  if (!isOpen || !currentQR) return null;

  const handleCopyPassword = () => {
    if (!currentQR.content?.password) return;
    navigator.clipboard.writeText(currentQR.content.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleCopyPix = () => {
    if (!currentQR.content?.pixKey) return;
    navigator.clipboard.writeText(currentQR.content.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const isWifi = currentQR.type === 'wifi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col items-center">
        {/* Top Control Bar: Select which QR code to test */}
        <div className="mb-3 bg-slate-800 text-white px-4 py-2 rounded-2xl border border-slate-700 flex items-center space-x-3 shadow-xl max-w-md w-full justify-between">
          <div className="flex items-center space-x-2 truncate">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">Simulador de Câmera:</span>
            <select
              value={currentQR.shortCode}
              onChange={(e) => setSelectedShortCode(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-400 truncate max-w-[160px]"
            >
              {qrcodes.map((q) => (
                <option key={q.id} value={q.shortCode}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smartphone Mockup */}
        <div className="w-[340px] sm:w-[380px] h-[640px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
          {/* Phone Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Screen Container */}
          <div className="w-full h-full bg-slate-50 rounded-[36px] overflow-y-auto flex flex-col pt-8 pb-4 px-4 text-slate-900 relative">
            {/* Top Bar inside mobile */}
            <div className="text-center pt-2 pb-3 border-b border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {currentQR.clientName || 'Estabelecimento'}
              </span>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {currentQR.title}
              </h2>
            </div>

            {/* Screen Content based on QR Code type */}
            <div className="flex-1 py-4 flex flex-col justify-between">
              {isWifi ? (
                <div className="space-y-4">
                  {/* Wi-Fi Icon & Signal */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                      <Wifi className="w-8 h-8" />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center justify-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Conexão Segura & Alta Velocidade</span>
                    </div>
                  </div>

                  {/* Network Box */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Nome da Rede (SSID)
                      </span>
                      <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                        {currentQR.content?.ssid || 'MinhaRede'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Senha Atual do Wi-Fi
                      </span>
                      <div className="text-base font-black text-amber-700 font-mono mt-0.5 bg-amber-50/70 p-2 rounded-xl border border-amber-200/80">
                        {currentQR.content?.password || '(Rede Aberta Sem Senha)'}
                      </div>
                    </div>

                    {/* Copy Password Button */}
                    {currentQR.content?.password && (
                      <button
                        onClick={handleCopyPassword}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm ${
                          copiedPassword
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {copiedPassword ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Senha Copiada com Sucesso!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>1-Clique: Copiar Senha do Wi-Fi</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Welcome Note */}
                  {currentQR.content?.welcomeNote && (
                    <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 text-center italic">
                      "{currentQR.content.welcomeNote}"
                    </div>
                  )}

                  {/* Toggle Direct Connect QR */}
                  <div className="text-center pt-1">
                    <button
                      onClick={() => setShowDirectWifiQR(!showDirectWifiQR)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center justify-center space-x-1 mx-auto"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>
                        {showDirectWifiQR ? 'Ocultar QR Nativo' : 'Conectar outro aparelho na tela'}
                      </span>
                    </button>

                    {showDirectWifiQR && directWifiDataUrl && (
                      <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-md inline-block">
                        <img
                          src={directWifiDataUrl}
                          alt="Wi-Fi QR Nativo"
                          className="w-36 h-36 mx-auto object-contain"
                        />
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Aponte outra câmera para conectar direto
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentQR.type === 'url' ? (
                <div className="space-y-4 text-center my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                    <ExternalLink className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Redirecionamento Automático</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto truncate font-mono">
                      {currentQR.content?.targetUrl}
                    </p>
                  </div>
                  <a
                    href={currentQR.content?.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <span>Acessar Link Agora</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : currentQR.type === 'whatsapp' ? (
                <div className="space-y-4 text-center my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Atendimento WhatsApp</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentQR.content?.phoneNumber}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${(currentQR.content?.phoneNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(currentQR.content?.defaultMessage || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <span>Iniciar Conversa no WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : currentQR.type === 'pix' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-2">Pagamento via Pix</h3>
                    {currentQR.content?.amount && (
                      <div className="text-xl font-black text-teal-700 mt-1">
                        R$ {parseFloat(currentQR.content.amount).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Beneficiário</span>
                      <div className="font-semibold text-slate-800">
                        {currentQR.content?.merchantName || currentQR.clientName}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Chave Pix</span>
                      <div className="font-mono text-slate-800 text-[11px] truncate bg-slate-50 p-2 rounded-lg">
                        {currentQR.content?.pixKey}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm ${
                      copiedPix ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
                    }`}
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Chave Pix Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Chave Pix</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {currentQR.content?.text || 'Sem conteúdo'}
                </div>
              )}

              {/* Instructions footer */}
              <div className="pt-3 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400">
                  📱 Sistema QR Dinâmico Inteligente • Atualizado em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
