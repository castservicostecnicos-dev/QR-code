import React, { useState, useEffect } from 'react';
import { X, Printer, Wifi, Sparkles, Building2, Check, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import type { QRCodeItem } from '../types';
import { generateQRDataUrl } from '../utils/qrGenerator';

interface PrintTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCodeItem | null;
}

export const PrintTemplateModal: React.FC<PrintTemplateModalProps> = ({
  isOpen,
  onClose,
  qrCode,
}) => {
  const [dataUrl, setDataUrl] = useState('');
  const [templateSize, setTemplateSize] = useState<'table' | 'a5' | 'a4'>('table');
  const [customHeader, setCustomHeader] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    if (!qrCode || !isOpen) return;
    const dynamicUrl = `${window.location.origin}/q/${qrCode.shortCode}`;
    const payload = qrCode.mode === 'static'
      ? (qrCode.rawStaticData || qrCode.content?.targetUrl || qrCode.content?.text || dynamicUrl)
      : dynamicUrl;

    generateQRDataUrl(payload, qrCode.design, 1024).then((url) => {
      setDataUrl(url);
    });

    if (qrCode.type === 'wifi') {
      setCustomHeader(qrCode.design.frameText || 'CONECTE-SE AO NOSSO WI-FI');
      setCustomInstructions('Aponte a câmera do seu celular para conectar automaticamente!');
    } else {
      setCustomHeader(qrCode.design.frameText || 'ESCANEIE COM O CELULAR');
      setCustomInstructions('Aponte a câmera do seu celular para acessar instantaneamente!');
    }
  }, [qrCode, isOpen]);

  if (!isOpen || !qrCode) return null;

  const handlePrint = () => {
    window.print();
  };

  const isWifi = qrCode.type === 'wifi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Modal Controls (Hidden in print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Impressão de Placa para Balcão & Mesa</h3>
              <p className="text-xs text-slate-400">Layout profissional pronto para gráficas ou impressora comum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar (Hidden in print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Formato:</span>
            <button
              onClick={() => setTemplateSize('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                templateSize === 'table'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Placa de Mesa (10x15cm)
            </button>
            <button
              onClick={() => setTemplateSize('a5')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                templateSize === 'a5'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Cartaz A5
            </button>
            <button
              onClick={() => setTemplateSize('a4')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                templateSize === 'a4'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Folha A4
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Placa Agora</span>
          </button>
        </div>

        {/* Printable Canvas Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/50 flex justify-center items-center">
          <div
            id="print-sheet"
            className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-slate-300 max-w-sm w-full text-center flex flex-col items-center justify-between transition-all"
            style={{
              minHeight: templateSize === 'table' ? '460px' : templateSize === 'a5' ? '540px' : '620px',
            }}
          >
            {/* Plaque Header */}
            <div className="w-full">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center space-x-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{qrCode.clientName || 'ESTABELECIMENTO'}</span>
              </div>

              <div
                className="py-2.5 px-4 rounded-xl text-white font-black text-sm uppercase tracking-wider shadow-sm mt-1 mb-4"
                style={{ backgroundColor: qrCode.design.frameColor || qrCode.design.fgColor || '#0f172a' }}
              >
                {customHeader}
              </div>
            </div>

            {/* QR Code Presentation */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-inner my-2 flex flex-col items-center">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="QR Code Placa"
                  className="w-56 h-56 object-contain rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Carregando QR...
                </div>
              )}
            </div>

            {/* Wi-Fi Credentials info on Plaque */}
            {isWifi && (
              <div className="w-full bg-slate-100/90 rounded-2xl p-3 border border-slate-200 my-2 text-slate-800">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nome da Rede Wi-Fi (SSID)
                </div>
                <div className="text-base font-black text-slate-900 tracking-wide font-mono mt-0.5">
                  {qrCode.content?.ssid || 'MinhaRede'}
                </div>
              </div>
            )}

            {/* Step by Step Instructions */}
            <div className="w-full mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-center space-x-1.5 font-bold text-slate-800">
                <span>1. Abra a câmera do celular</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>2. Aponte para o QR Code</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {customInstructions}
              </p>
              {qrCode.mode !== 'static' && (
                <p className="text-[9px] text-emerald-700 font-medium">
                  ✓ Rede monitorada e senha atualizada automaticamente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
