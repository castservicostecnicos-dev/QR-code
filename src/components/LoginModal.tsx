import React, { useState } from 'react';
import { X, Lock, Mail, Shield, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import type { UserSession, ClientUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  clients: ClientUser[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  clients,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Informe seu e-mail de acesso.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar login.');
      }

      onLoginSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDevLogin = () => {
    onLoginSuccess({
      role: 'dev',
      user: {
        id: 'dev',
        name: 'Administrador Dev (Master)',
        email: 'dev@qrcode.local',
        company: 'Dev Studio / Master',
      },
    });
    onClose();
  };

  const handleQuickClientLogin = (c: ClientUser) => {
    onLoginSuccess({
      role: 'client',
      user: {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Acesso à Plataforma</h3>
              <p className="text-xs text-slate-400">Entre como Dev Master ou Cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>E-mail cadastrado</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: seu-email@exemplo.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Senha de Acesso</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar na Plataforma'}
            </button>
          </form>

          {/* Quick Access Shortcuts for Demo & Testing */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Atalhos de Acesso Rápido (Demonstração):
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleQuickDevLogin}
                className="w-full text-left p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 text-xs flex items-center justify-between border border-indigo-200/60 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">Entrar como Dev Master (Controle Total)</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-mono">dev@qrcode.local</span>
              </button>

              {clients.slice(0, 2).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleQuickClientLogin(c)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs flex items-center justify-between border border-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{c.company}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate ml-2">
                    {c.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
