import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Sliders,
  Shield,
  UserCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import type { UserSession, ClientUser } from '../types';

interface HeaderProps {
  currentSession: UserSession;
  clients: ClientUser[];
  activeDevTab: 'clients' | 'control';
  onSelectDevTab: (tab: 'clients' | 'control') => void;
  onSwitchSession: (session: UserSession) => void;
  onOpenLoginModal: () => void;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  clients,
  activeDevTab,
  onSelectDevTab,
  onSwitchSession,
  onOpenLoginModal,
  onOpenSimulator,
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const isDev = currentSession.role === 'dev';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md w-full overflow-x-hidden">
      <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  QR Dinâmico
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Reutilizável
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Altere o destino e a senha do Wi-Fi sem reimprimir
              </p>
            </div>
          </div>

          {/* Center: Dev Navigation Tabs (if Dev) */}
          {isDev && (
            <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => onSelectDevTab('clients')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeDevTab === 'clients'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>1. Gestão de Clientes</span>
                {clients.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-indigo-950/60 text-indigo-200 text-xs rounded-full">
                    {clients.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectDevTab('control')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeDevTab === 'control'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>2. Sistema de Geração & Controle</span>
              </button>
            </div>
          )}

          {/* Right Profile & Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Mobile Scan Simulation */}
            <button
              onClick={onOpenSimulator}
              title="Simular escaneamento com celular"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Simular Câmera</span>
            </button>

            {/* Profile Dropdown / Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                  isDev
                    ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/60'
                    : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60'
                }`}
              >
                {isDev ? (
                  <Shield className="w-4 h-4 text-indigo-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )}
                <div className="text-left max-w-[120px] sm:max-w-[180px] truncate">
                  <div className="font-semibold truncate">
                    {isDev ? 'Acesso Dev (Master)' : currentSession.user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {isDev ? 'Painel Completo Dev' : currentSession.user.company}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Dropdown Menu */}
              {showSwitchDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 text-slate-200"
                  onClick={() => setShowSwitchDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Alternar Ambiente de Acesso</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  {/* Dev Master option */}
                  <button
                    onClick={() => {
                      onSwitchSession({
                        role: 'dev',
                        user: {
                          id: 'dev',
                          name: 'Administrador Dev (Master)',
                          email: 'dev@qrcode.local',
                          company: 'Dev Studio / Master',
                        },
                      });
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      isDev ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Acesso Dev Master (Você)</div>
                        <div className="text-[10px] text-slate-400">Controle total e cadastro de clientes</div>
                      </div>
                    </div>
                    {isDev && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </button>

                  <div className="px-4 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Clientes Cadastrados ({clients.length})
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {clients.map((c) => {
                      const isCurrent = !isDev && currentSession.user.id === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSwitchSession({
                              role: 'client',
                              user: {
                                id: c.id,
                                name: c.name,
                                email: c.email,
                                company: c.company,
                              },
                            });
                          }}
                          className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            isCurrent ? 'bg-emerald-950/40 text-emerald-300 font-semibold' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="truncate">{c.company || c.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{c.email}</div>
                            </div>
                          </div>
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-800 mt-1">
                    <button
                      onClick={onOpenLoginModal}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Fazer Login com Outras Credenciais</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dev Tabs - Wrapped into clean lines when needed without horizontal scroll */}
        {isDev && (
          <div className="flex flex-wrap md:hidden border-t border-slate-800 py-2 gap-2 w-full">
            <button
              onClick={() => onSelectDevTab('clients')}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                activeDevTab === 'clients'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Clientes ({clients.length})</span>
            </button>
            <button
              onClick={() => onSelectDevTab('control')}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                activeDevTab === 'control'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Geração & Controle</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
