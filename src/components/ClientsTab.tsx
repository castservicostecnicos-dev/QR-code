import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  KeyRound,
  ExternalLink,
  Edit2,
  Trash2,
  QrCode,
  BarChart3,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import type { ClientUser, UserSession } from '../types';

interface ClientsTabProps {
  clients: ClientUser[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (client: ClientUser) => void;
  onDeleteClient: (clientId: string) => void;
  onToggleStatus: (client: ClientUser) => void;
  onImpersonateClient: (client: ClientUser) => void;
  onSelectClientFilterInControl: (clientId: string) => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteClient,
  onToggleStatus,
  onImpersonateClient,
  onSelectClientFilterInControl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyCredentials = (client: ClientUser) => {
    const text = `🔑 *Dados de Acesso ao Painel QR Dinâmico*\n\n` +
      `Olá ${client.name}!\n` +
      `Seu acesso exclusivo para gerenciar seus QR Codes e alterar senhas de Wi-Fi sem reimprimir já está ativo.\n\n` +
      `🏢 Estabelecimento: ${client.company}\n` +
      `📧 E-mail: ${client.email}\n` +
      `🔒 Senha: ${client.password || '123456'}\n` +
      `🔗 Acesse em: ${window.location.origin}\n\n` +
      `Qualquer dúvida, conte com nosso suporte!`;

    navigator.clipboard.writeText(text);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'all' ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalQRs = clients.reduce((acc, c) => acc + (c.qrCount || 0), 0);
  const totalScans = clients.reduce((acc, c) => acc + (c.totalScans || 0), 0);
  const activeCount = clients.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Módulo Dev Master - Gestão Multi-Clientes</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cadastro e Gestão de Clientes
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Cadastre estabelecimentos e clientes para que utilizem a plataforma com suas próprias credenciais de acesso, gerenciando seus QR Codes reutilizáveis (como redes Wi-Fi e cardápios).
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5" />
            <span>Cadastrar Novo Cliente</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/60">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium">Total de Clientes</span>
            <div className="text-xl font-bold text-white mt-0.5">{clients.length}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium">Clientes Ativos</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium">QRs Vinculados</span>
            <div className="text-xl font-bold text-indigo-300 mt-0.5">{totalQRs}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium">Leituras Totais</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{totalScans}</div>
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, empresa, e-mail ou telefone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inativos ({clients.length - activeCount})
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhum cliente encontrado</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua busca. Tente outros termos.'
              : 'Comece cadastrando seu primeiro cliente para fornecer acesso individual ao sistema.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onOpenCreateModal}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Primeiro Cliente</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const isPasswordVisible = visiblePasswords[client.id] || false;
            const isCopied = copiedId === client.id;
            const maxQRs = client.maxQRCodes || 10;
            const currentQRs = client.qrCount || 0;
            const usagePercent = Math.min(100, Math.round((currentQRs / maxQRs) * 100));

            return (
              <div
                key={client.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-lg flex flex-col justify-between ${
                  client.status === 'active'
                    ? 'border-slate-200/90 hover:border-indigo-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                        {client.company.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 leading-tight">
                          {client.company}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                          <span>{client.name}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStatus(client)}
                      title={`Clique para ${client.status === 'active' ? 'desativar' : 'ativar'}`}
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        client.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {client.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Inativo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Contact Details & Credentials */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700 truncate">{client.email}</span>
                    </div>

                    {client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}

                    {/* Password display with toggle */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="flex items-center space-x-2">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-[11px] text-slate-500">Senha:</span>
                        <span className="font-mono font-medium text-slate-800">
                          {isPasswordVisible ? client.password || '123456' : '••••••••'}
                        </span>
                      </div>
                      <button
                        onClick={() => togglePasswordVisibility(client.id)}
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

                    {client.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/60 border border-amber-200/40 p-2 rounded-lg">
                        "{client.notes}"
                      </p>
                    )}
                  </div>

                  {/* QR Codes and Scans Counters */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium flex items-center space-x-1">
                        <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                        <span>QRs Criados:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {currentQRs} / {maxQRs}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2 text-slate-500">
                      <span className="flex items-center space-x-1">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Total de Leituras:</span>
                      </span>
                      <span className="font-bold text-emerald-600">
                        {client.totalScans || 0} acessos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {/* Impersonate / Enter as Client */}
                    <button
                      onClick={() => onImpersonateClient(client)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                      title="Abrir o painel com a visão exata do cliente"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Acessar Painel</span>
                    </button>

                    {/* Copy Credentials for WhatsApp */}
                    <button
                      onClick={() => copyCredentials(client)}
                      className={`flex items-center justify-center space-x-1 py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                        isCopied
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Copiar mensagem pronta com credenciais para enviar no WhatsApp"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px] hidden sm:inline">Copiar Acesso</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => onSelectClientFilterInControl(client.id)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center space-x-1"
                    >
                      <span>Ver QRs deste cliente</span>
                      <span>→</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onOpenEditModal(client)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                        title="Editar Dados e Senha"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
