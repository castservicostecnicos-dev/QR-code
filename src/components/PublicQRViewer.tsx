import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  MessageCircle,
  CreditCard,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import type { QRCodeItem } from '../types';
import { generateQRDataUrl, generateRawWifiString } from '../utils/qrGenerator';
import { getLocalQRCodes } from '../utils/storage';

interface PublicQRViewerProps {
  shortCode: string;
  onGoHome?: () => void;
}

export const PublicQRViewer: React.FC<PublicQRViewerProps> = ({ shortCode, onGoHome }) => {
  const [qrCode, setQrCode] = useState<QRCodeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [showDirectWifiQR, setShowDirectWifiQR] = useState(false);
  const [directWifiDataUrl, setDirectWifiDataUrl] = useState('');

  useEffect(() => {
    async function fetchQR() {
      try {
        setLoading(true);
        let data: QRCodeItem | null = null;

        try {
          const res = await fetch(`/api/qrcodes/${shortCode}`);
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // Static host without backend
        }

        if (!data) {
          const localList = getLocalQRCodes();
          const found = localList.find(
            (q) => q.shortCode.toLowerCase() === shortCode.toLowerCase()
          );
          if (found) {
            data = found;
          }
        }

        if (!data) {
          throw new Error('QR Code não encontrado ou desativado.');
        }

        setQrCode(data);

        // Generate raw Wi-Fi string if type is wifi
        if (data.type === 'wifi' && data.content?.ssid) {
          const raw = generateRawWifiString(
            data.content.ssid,
            data.content.password || '',
            data.content.securityType || 'WPA'
          );
          const url = await generateQRDataUrl(raw, {
            fgColor: '#000000',
            bgColor: '#ffffff',
            frame: 'none',
          }, 400);
          setDirectWifiDataUrl(url);
        }
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar dados do QR Code.');
      } finally {
        setLoading(false);
      }
    }

    if (shortCode) {
      fetchQR();
    }
  }, [shortCode]);

  const handleCopyPassword = () => {
    if (!qrCode?.content?.password) return;
    navigator.clipboard.writeText(qrCode.content.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleCopyPix = () => {
    if (!qrCode?.content?.pixKey) return;
    navigator.clipboard.writeText(qrCode.content.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Carregando destino do QR Code...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">QR Code Não Disponível</h2>
          <p className="text-xs text-slate-500">{error || 'Código inválido ou removido.'}</p>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Voltar para o Painel
            </button>
          )}
        </div>
      </div>
    );
  }

  const isWifi = qrCode.type === 'wifi';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4 flex flex-col items-center justify-center">
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="mb-4 flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel Administrativo</span>
        </button>
      )}

      {/* Main Mobile Screen Box */}
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-fadeIn">
        {/* Header */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            {qrCode.clientName || 'Estabelecimento'}
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-0.5 leading-snug">
            {qrCode.title}
          </h1>
        </div>

        {/* Dynamic Wi-Fi Presentation */}
        {isWifi ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
              <Wifi className="w-8 h-8" />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nome da Rede Wi-Fi (SSID)
                </span>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {qrCode.content?.ssid || 'MinhaRede'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Senha da Rede
                </span>
                <div className="text-base font-black text-amber-800 font-mono mt-0.5 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  {qrCode.content?.password || '(Sem senha)'}
                </div>
              </div>

              {qrCode.content?.password && (
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
                      <span>Copiar Senha do Wi-Fi</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {qrCode.content?.welcomeNote && (
              <p className="text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl italic">
                "{qrCode.content.welcomeNote}"
              </p>
            )}

            {/* Direct Connect QR */}
            <div>
              <button
                onClick={() => setShowDirectWifiQR(!showDirectWifiQR)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center justify-center space-x-1 mx-auto"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>
                  {showDirectWifiQR ? 'Ocultar Código de Conexão' : 'Conectar outro celular na tela'}
                </span>
              </button>

              {showDirectWifiQR && directWifiDataUrl && (
                <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-md inline-block">
                  <img
                    src={directWifiDataUrl}
                    alt="QR Wi-Fi Nativo"
                    className="w-40 h-40 mx-auto object-contain"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Aponte a câmera para conectar direto
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : qrCode.type === 'url' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Você está sendo redirecionado para o link oficial:
            </p>
            <a
              href={qrCode.content?.targetUrl}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <span>Abrir Página Agora</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : qrCode.type === 'pix' ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Beneficiário</span>
                <div className="font-semibold text-slate-800">
                  {qrCode.content?.merchantName || qrCode.clientName}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Chave Pix</span>
                <div className="font-mono text-slate-800 text-[11px] truncate bg-white p-2 rounded-lg border border-slate-200">
                  {qrCode.content?.pixKey}
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
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
            {qrCode.content?.text || 'Sem conteúdo adicional'}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100">
          QR Dinâmico • Tecnologia de Conexão Inteligente
        </div>
      </div>
    </div>
  );
};
