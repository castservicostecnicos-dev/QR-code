import React from 'react';
import { X, BarChart3, Smartphone, Laptop, Calendar, Clock, ShieldCheck, Users, Eye } from 'lucide-react';
import type { QRCodeItem } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCodeItem | null;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  qrCode,
}) => {
  if (!isOpen || !qrCode) return null;

  const logs = qrCode.scanLogs || [];
  const total = qrCode.totalScans || 0;

  // Breakdown by device
  const deviceCounts: Record<string, number> = {};
  logs.forEach((log) => {
    const dev = log.device || 'Mobile';
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Estatísticas de Leituras</h3>
              <p className="text-xs text-slate-400">{qrCode.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Counter Card */}
          <div className="bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/60 rounded-2xl p-5 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Escaneamentos
            </span>
            <div className="text-4xl font-extrabold text-slate-900 mt-1">
              {total}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {qrCode.mode === 'static'
                ? 'QR Code Estático: escaneamentos físicos são diretos e offline'
                : 'QR Code Dinâmico monitorado em tempo real pelo servidor'}
            </p>
          </div>

          {/* Device Distribution */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Aparelhos dos Clientes</span>
            </h4>
            {Object.keys(deviceCounts).length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                Ainda não há registros detalhados de dispositivos para este código.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(deviceCounts).map(([device, count]) => {
                  const pct = Math.round((count / (logs.length || 1)) * 100);
                  return (
                    <div key={device} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{device}</span>
                        <span className="font-bold text-slate-900">{count} leituras ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Scans Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Últimos Acessos Registrados</span>
            </h4>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                Nenhuma leitura recente registrada ainda.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {logs.slice(0, 15).map((log, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-700">{log.device || 'Celular'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
