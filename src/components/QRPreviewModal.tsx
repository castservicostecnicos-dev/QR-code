import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Share2,
  FileCode,
  ShieldCheck,
  Wifi,
  Globe,
  Lock
} from 'lucide-react';
import type { QRCodeItem } from '../types';
import { generateQRDataUrl, generateQRSvg } from '../utils/qrGenerator';

interface QRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCodeItem | null;
  onOpenEditDestination: (qr: QRCodeItem) => void;
  onOpenPrintTemplate: (qr: QRCodeItem) => void;
  onSimulateScan: (shortCode: string) => void;
}

export const QRPreviewModal: React.FC<QRPreviewModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  onOpenEditDestination,
  onOpenPrintTemplate,
  onSimulateScan,
}) => {
  const [dataUrl, setDataUrl] = useState('');
  const [svgString, setSvgString] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrCode || !isOpen) return;

    const dynamicUrl = `${window.location.origin}/q/${qrCode.shortCode}`;
    const payload = qrCode.mode === 'static'
      ? (qrCode.rawStaticData || qrCode.content?.targetUrl || qrCode.content?.text || dynamicUrl)
      : dynamicUrl;

    generateQRDataUrl(payload, qrCode.design, 1024).then((url) => {
      setDataUrl(url);
    });
    generateQRSvg(payload, qrCode.design).then((svg) => {
      setSvgString(svg);
    });
  }, [qrCode, isOpen]);

  if (!isOpen || !qrCode) return null;

  const dynamicUrl = `${window.location.origin}/q/${qrCode.shortCode}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(dynamicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadPNG = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${qrCode.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${qrCode.shortCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isWifi = qrCode.type === 'wifi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">{qrCode.title}</h3>
            <p className="text-xs text-slate-400">
              {qrCode.clientName || 'Dev Master'} • {qrCode.totalScans} leituras registradas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col items-center space-y-5">
          {/* Reusable or Static badge */}
          {qrCode.mode === 'static' ? (
            <div className="w-full bg-amber-50 border border-amber-200/90 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="leading-tight">
                <strong>QR Code Estático Permanente:</strong> Destino gravado diretamente na imagem. Não é editável após a criação.
              </span>
            </div>
          ) : (
            <div className="w-full bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-tight">
                <strong>QR Code Dinâmico Reutilizável:</strong> Troque a senha ou destino a qualquer momento sem trocar esta imagem impressa!
              </span>
            </div>
          )}

          {/* QR Code Presentation Box with Frame */}
          <div
            ref={containerRef}
            className="p-5 rounded-2xl shadow-xl flex flex-col items-center transition-all border"
            style={{
              backgroundColor: qrCode.design.bgColor || '#ffffff',
              borderColor: qrCode.design.frameColor || '#e2e8f0',
              borderWidth: qrCode.design.frame !== 'none' ? '3px' : '1px',
              maxWidth: '300px',
              width: '100%',
            }}
          >
            {/* Frame Top Header */}
            {qrCode.design.frame !== 'none' && qrCode.design.frameText && (
              <div
                className="w-full py-1.5 px-3 rounded-lg text-center text-xs font-black uppercase tracking-wider mb-2 text-white shadow-sm"
                style={{ backgroundColor: qrCode.design.frameColor || '#0f172a' }}
              >
                {qrCode.design.frameText}
              </div>
            )}

            {/* QR Code Graphic */}
            <div className="relative">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt={qrCode.title}
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Gerando QR Code...
                </div>
              )}
            </div>

            {/* Bottom details inside card */}
            <div className="w-full mt-3 pt-2 border-t border-slate-100 text-center">
              {isWifi ? (
                <div className="text-xs text-slate-700">
                  <div className="font-bold flex items-center justify-center space-x-1">
                    <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rede: {qrCode.content?.ssid || 'Wi-Fi'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Senha: {qrCode.content?.password || '(Sem senha)'}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-700 font-medium truncate">
                  {qrCode.content?.targetUrl || qrCode.content?.phoneNumber || qrCode.title}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Link URL with 1-click copy */}
          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Link de Redirecionamento Dinâmico
            </span>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-xs font-mono text-indigo-700 truncate font-semibold">
                {dynamicUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className={`p-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1 shrink-0 transition-colors ${
                  copiedUrl
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Copiar URL para a área de transferência"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Edit Destination Button (Only for Dynamic QR codes) */}
          {qrCode.mode === 'static' ? (
            <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>QR Code Estático: Destino Fixo Permanente (Não Editável)</span>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenEditDestination(qrCode);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>
                {isWifi ? 'Alterar Senha do Wi-Fi Remotamente' : 'Alterar Destino do Link Remotamente'}
              </span>
            </button>
          )}

          {/* Action Downloads Grid */}
          <div className="w-full grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadPNG}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PNG (1024px)</span>
            </button>

            <button
              onClick={handleDownloadSVG}
              className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Baixar SVG Vetor</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPrintTemplate(qrCode);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Placa de Balcão e Mesa</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSimulateScan(qrCode.shortCode);
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Simular no Celular</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
