import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Link2,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import type { QRCodeItem } from '../types';

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCodeItem | null;
  onSave: (id: string, updatedContent: any) => Promise<void>;
  onTestScan?: (shortCode: string) => void;
}

export const EditDestinationModal: React.FC<EditDestinationModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  onSave,
  onTestScan,
}) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [securityType, setSecurityType] = useState<'WPA' | 'WEP' | 'nopass' | 'WPA3'>('WPA');
  const [welcomeNote, setWelcomeNote] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (qrCode) {
      setSsid(qrCode.content?.ssid || '');
      setPassword(qrCode.content?.password || '');
      setSecurityType(qrCode.content?.securityType || 'WPA');
      setWelcomeNote(qrCode.content?.welcomeNote || '');
      setTargetUrl(qrCode.content?.targetUrl || '');
      setPhoneNumber(qrCode.content?.phoneNumber || '');
      setDefaultMessage(qrCode.content?.defaultMessage || '');
      setPixKey(qrCode.content?.pixKey || '');
      setAmount(qrCode.content?.amount || '');
      setSuccess(false);
    }
  }, [qrCode, isOpen]);

  if (!isOpen || !qrCode) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let updatedContent: any = {};
    if (qrCode.type === 'wifi') {
      updatedContent = {
        ...qrCode.content,
        ssid: ssid.trim(),
        password: password.trim(),
        securityType,
        welcomeNote: welcomeNote.trim(),
      };
    } else if (qrCode.type === 'url') {
      let cleanUrl = targetUrl.trim();
      if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }
      updatedContent = {
        ...qrCode.content,
        targetUrl: cleanUrl,
      };
    } else if (qrCode.type === 'whatsapp') {
      updatedContent = {
        ...qrCode.content,
        phoneNumber: phoneNumber.trim(),
        defaultMessage: defaultMessage.trim(),
      };
    } else if (qrCode.type === 'pix') {
      updatedContent = {
        ...qrCode.content,
        pixKey: pixKey.trim(),
        amount: amount.trim(),
      };
    }

    try {
      await onSave(qrCode.id, updatedContent);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  const isWifi = qrCode.type === 'wifi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base text-white">
                  {isWifi ? 'Alterar Senha do Wi-Fi Remotamente' : 'Editar Destino Dinâmico'}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                {qrCode.title} (Código: <span className="font-mono text-amber-300">{qrCode.shortCode}</span>)
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

        {/* Reusability Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-start space-x-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-950">
              O QR Code impresso CONTINUA O MESMO!
            </span>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Não precisa reimprimir placas, adesivos ou cardápios. Qualquer pessoa que escanear o material já impresso receberá a nova configuração instantaneamente.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Destino atualizado com sucesso no servidor!</span>
            </div>
          )}

          {isWifi ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Nome da Rede Wi-Fi (SSID)</span>
                </label>
                <input
                  type="text"
                  required
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="Ex: MinhaLoja_Clientes_5G"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nova Senha do Wi-Fi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Ocultar</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Mostrar</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a nova senha (ou deixe em branco se for rede aberta)"
                  className="w-full px-3 py-2.5 text-sm font-mono font-medium bg-amber-50/50 border border-amber-200 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Trocou a senha no roteador? Digite-a aqui e todos os clientes já terão acesso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Criptografia
                  </label>
                  <select
                    value={securityType}
                    onChange={(e: any) => setSecurityType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WPA">WPA / WPA2 (Padrão e Mais Comum)</option>
                    <option value="WPA3">WPA3 (Mais Recente e Seguro)</option>
                    <option value="WEP">WEP (Antigo)</option>
                    <option value="nopass">Rede Aberta (Sem Senha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aviso para o Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={welcomeNote}
                    onChange={(e) => setWelcomeNote(e.target.value)}
                    placeholder="Ex: Senha atualizada semanalmente!"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : qrCode.type === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Novo Link de Destino (URL)</span>
              </label>
              <input
                type="text"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://exemplo.com/novo-cardapio"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Ao escanear a placa física, o cliente será redirecionado para este novo link.
              </p>
            </div>
          ) : qrCode.type === 'whatsapp' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número do WhatsApp (com DDD)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="5511987654321"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mensagem Automática Pré-preenchida
                </label>
                <textarea
                  rows={2}
                  value={defaultMessage}
                  onChange={(e) => setDefaultMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </>
          ) : qrCode.type === 'pix' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chave Pix Atualizada
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor em R$ (Opcional)
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 50.00"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </>
          ) : null}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {onTestScan ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTestScan(qrCode.shortCode);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center space-x-1"
              >
                <span>Simular leitura agora</span>
                <span>→</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Atualizando...' : 'Salvar e Atualizar QR Code'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
