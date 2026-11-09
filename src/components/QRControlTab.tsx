import React, { useState } from 'react';
import {
  QrCode,
  Plus,
  Search,
  Wifi,
  Link2,
  MessageCircle,
  CreditCard,
  Contact,
  FileText,
  RefreshCw,
  Eye,
  EyeOff,
  Printer,
  Download,
  BarChart3,
  Smartphone,
  Trash2,
  Edit,
  Play,
  Pause,
  ShieldCheck,
  Building2,
  Sparkles,
  Lock,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import type { QRCodeItem, QRCodeType, ClientUser, UserSession } from '../types';

interface QRControlTabProps {
  qrcodes: QRCodeItem[];
  clients: ClientUser[];
  currentSession: UserSession;
  onOpenCreateModal: () => void;
  onOpenEditModal: (qr: QRCodeItem) => void;
  onOpenEditDestination: (qr: QRCodeItem) => void;
  onOpenPreviewModal: (qr: QRCodeItem) => void;
  onOpenPrintTemplate: (qr: QRCodeItem) => void;
  onOpenAnalytics: (qr: QRCodeItem) => void;
  onDeleteQRCode: (id: string) => void;
  onToggleStatus: (qr: QRCodeItem) => void;
  onSimulateScan: (shortCode: string) => void;
  selectedClientFilter?: string;
  onSetClientFilter?: (clientId: string) => void;
}

export const QRControlTab: React.FC<QRControlTabProps> = ({
  qrcodes,
  clients,
  currentSession,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenEditDestination,
  onOpenPreviewModal,
  onOpenPrintTemplate,
  onOpenAnalytics,
  onDeleteQRCode,
  onToggleStatus,
  onSimulateScan,
  selectedClientFilter = 'all',
  onSetClientFilter,
}) => {
  const isDev = currentSession.role === 'dev';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'dynamic' | 'static'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyShortUrl = (shortCode: string, id: string) => {
    const url = `${window.location.origin}/q/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter QR codes
  const filteredQRs = qrcodes.filter((qr) => {
    // If not dev, client can only see their own
    if (!isDev && qr.clientId !== currentSession.user.id) {
      return false;
    }

    // Client filter (for dev)
    if (isDev && selectedClientFilter && selectedClientFilter !== 'all') {
      if (qr.clientId !== selectedClientFilter) return false;
    }

    // Mode filter (dynamic vs static)
    if (modeFilter === 'dynamic' && qr.mode === 'static') return false;
    if (modeFilter === 'static' && qr.mode !== 'static') return false;

    // Type filter
    if (typeFilter !== 'all' && qr.type !== typeFilter) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = qr.title.toLowerCase().includes(q);
      const matchShortCode = qr.shortCode.toLowerCase().includes(q);
      const matchClient = (qr.clientName || '').toLowerCase().includes(q);
      const matchSsid = (qr.content?.ssid || '').toLowerCase().includes(q);
      const matchUrl = (qr.content?.targetUrl || '').toLowerCase().includes(q);
      const matchText = (qr.content?.text || '').toLowerCase().includes(q);
      if (!matchTitle && !matchShortCode && !matchClient && !matchSsid && !matchUrl && !matchText) {
        return false;
      }
    }

    return true;
  });

  // Calculate metrics
  const totalQRs = qrcodes.length;
  const dynamicCount = qrcodes.filter((q) => q.mode !== 'static').length;
  const staticCount = qrcodes.filter((q) => q.mode === 'static').length;
  const wifiCount = qrcodes.filter((q) => q.type === 'wifi').length;
  const totalScans = qrcodes.reduce((sum, q) => sum + (q.totalScans || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>
                {isDev ? 'Aba 2: Sistema de Geração & Controle' : 'Painel de Gerenciamento'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Gerador & Central de QR Codes
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Crie QR Codes Dinâmicos para alterar a senha do Wi-Fi ou trocar o link remotamente sem reimprimir, ou gere QR Codes Estáticos com destino permanente.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Novo QR Code</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Total de Códigos</span>
            <div className="text-xl font-bold text-white mt-0.5">{totalQRs}</div>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Dinâmicos (Reutilizáveis)</span>
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{dynamicCount}</div>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-xs text-amber-400 font-medium flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Estáticos (Permanentes)</span>
            </span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{staticCount}</div>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-xs text-indigo-300 font-medium flex items-center space-x-1">
              <BarChart3 className="w-3 h-3 text-indigo-400" />
              <span>Leituras Acumuladas</span>
            </span>
            <div className="text-xl font-bold text-indigo-300 mt-0.5">{totalScans}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, Wi-Fi, URL, código..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Dev Client Filter */}
          {isDev && onSetClientFilter && (
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedClientFilter}
                onChange={(e) => onSetClientFilter(e.target.value)}
                className="w-full md:w-56 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">Todos os Estabelecimentos</option>
                <option value="dev">Dev Master (Próprios)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Filter: All / Dynamic / Static */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
            <button
              onClick={() => setModeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                modeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({qrcodes.length})
            </button>
            <button
              onClick={() => setModeFilter('dynamic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                modeFilter === 'dynamic'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Dinâmicos</span>
            </button>
            <button
              onClick={() => setModeFilter('static')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                modeFilter === 'static'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Estáticos</span>
            </button>
          </div>
        </div>

        {/* Type Badges Filter - Formatted in clean wrapped lines (no horizontal page scroll) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-400 text-[11px] shrink-0 uppercase tracking-wider mr-1">
            Tipo:
          </span>
          {[
            { id: 'all', label: 'Todos os Tipos' },
            { id: 'wifi', label: 'Wi-Fi' },
            { id: 'url', label: 'Link / URL' },
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'pix', label: 'Pix' },
            { id: 'vcard', label: 'Contato (vCard)' },
            { id: 'text', label: 'Texto' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                typeFilter === t.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* QR Codes Grid */}
      {filteredQRs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhum QR Code encontrado</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Clique no botão acima para criar o seu primeiro QR Code dinâmico ou estático.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onOpenCreateModal}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro QR Code</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQRs.map((qr) => {
            const isWifi = qr.type === 'wifi';
            const isUrl = qr.type === 'url';
            const isStatic = qr.mode === 'static';
            const isPasswordVisible = visiblePasswords[qr.id] || false;
            const isCopied = copiedId === qr.id;

            return (
              <div
                key={qr.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-lg flex flex-col justify-between ${
                  qr.status === 'active'
                    ? isStatic
                      ? 'border-amber-200 hover:border-amber-400'
                      : 'border-slate-200 hover:border-indigo-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                {/* Card Top Body */}
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Mode Badge */}
                      {isStatic ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>Estático (Permanente)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Sparkles className="w-3 h-3 text-emerald-700" />
                          <span>Dinâmico (Reutilizável)</span>
                        </span>
                      )}

                      {/* Type Badge */}
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {qr.type === 'wifi' && <Wifi className="w-3 h-3 text-indigo-600" />}
                        {qr.type === 'url' && <Link2 className="w-3 h-3 text-blue-600" />}
                        {qr.type === 'whatsapp' && <MessageCircle className="w-3 h-3 text-emerald-600" />}
                        {qr.type === 'pix' && <CreditCard className="w-3 h-3 text-teal-600" />}
                        {qr.type === 'vcard' && <Contact className="w-3 h-3 text-purple-600" />}
                        {qr.type === 'text' && <FileText className="w-3 h-3 text-amber-600" />}
                        <span className="uppercase">{qr.type}</span>
                      </span>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() => onToggleStatus(qr)}
                      title={`Clique para ${qr.status === 'active' ? 'pausar' : 'ativar'}`}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors ${
                        qr.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {qr.status === 'active' ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>

                  {/* Title & Client */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                    {qr.title}
                  </h3>
                  {isDev && (
                    <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{qr.clientName || 'Dev Master'}</span>
                    </div>
                  )}

                  {/* Content Highlights Box */}
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    {isWifi ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium flex items-center space-x-1">
                            <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Rede (SSID):</span>
                          </span>
                          <span className="font-bold text-slate-900 font-mono">
                            {qr.content?.ssid || 'Não definida'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium">Senha do Wi-Fi:</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-amber-700">
                              {isPasswordVisible
                                ? qr.content?.password || '(Sem senha)'
                                : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(qr.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : isUrl ? (
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px] mb-0.5">
                          Destino Atual:
                        </span>
                        <a
                          href={qr.content?.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline truncate block"
                        >
                          {qr.content?.targetUrl}
                        </a>
                      </div>
                    ) : qr.type === 'whatsapp' ? (
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px]">Número:</span>
                        <span className="font-semibold text-emerald-700 font-mono">
                          {qr.content?.phoneNumber}
                        </span>
                      </div>
                    ) : qr.type === 'pix' ? (
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px]">Chave Pix:</span>
                        <span className="font-mono font-semibold text-teal-700 truncate block">
                          {qr.content?.pixKey}
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-600 italic truncate">
                        {qr.content?.text || qr.content?.fullName || 'Conteúdo gravado'}
                      </div>
                    )}
                  </div>

                  {/* Primary Reusable Feature Button: "Alterar Senha do Wi-Fi" */}
                  {!isStatic ? (
                    <button
                      onClick={() => onOpenEditDestination(qr)}
                      className="w-full mt-3 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 text-xs font-bold flex items-center justify-center space-x-2 transition-all hover:shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {isWifi
                          ? 'Alterar Senha do Wi-Fi (Sem Reimprimir)'
                          : 'Alterar Destino do Link'}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full mt-3 py-1.5 px-3 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold flex items-center justify-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Destino Permanente Fixo (Não Editável)</span>
                    </div>
                  )}

                  {/* Short Link & Analytics */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1 truncate max-w-[170px]">
                      <span className="font-mono text-indigo-600 font-semibold truncate">
                        /q/{qr.shortCode}
                      </span>
                      <button
                        onClick={() => copyShortUrl(qr.shortCode, qr.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                        title="Copiar link permanente"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenAnalytics(qr)}
                      className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium"
                      title="Ver estatísticas de leitura"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold text-slate-800">{qr.totalScans}</span>
                      <span>scans</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions Footer - Wraps into lines if space is restricted */}
                <div className="p-3 bg-slate-50/90 border-t border-slate-100 rounded-b-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* View QR & Download */}
                    <button
                      onClick={() => onOpenPreviewModal(qr)}
                      className="flex items-center space-x-1 py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                      title="Visualizar e Baixar PNG/SVG"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Ver QR</span>
                    </button>

                    {/* Table Plate / Print Stand */}
                    <button
                      onClick={() => onOpenPrintTemplate(qr)}
                      className="flex items-center space-x-1 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                      title="Imprimir Placa de Balcão e Mesa com Instruções"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Placa</span>
                    </button>

                    {/* Simulate Mobile Scan */}
                    <button
                      onClick={() => onSimulateScan(qr.shortCode)}
                      className="flex items-center space-x-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200 transition-colors"
                      title="Simular o que o cliente vê ao escanear com a câmera"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Testar</span>
                    </button>
                  </div>

                  {/* Edit design / Delete */}
                  <div className="flex items-center space-x-1">
                    {!isStatic && (
                      <button
                        onClick={() => onOpenEditModal(qr)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                        title="Editar Cores e Moldura"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteQRCode(qr.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir QR Code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
