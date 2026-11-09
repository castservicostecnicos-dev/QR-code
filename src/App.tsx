import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClientsTab } from './components/ClientsTab';
import { ClientModal } from './components/ClientModal';
import { QRControlTab } from './components/QRControlTab';
import { QRCodeModal } from './components/QRCodeModal';
import { EditDestinationModal } from './components/EditDestinationModal';
import { QRPreviewModal } from './components/QRPreviewModal';
import { PrintTemplateModal } from './components/PrintTemplateModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { MobileScanSimulator } from './components/MobileScanSimulator';
import { LoginModal } from './components/LoginModal';
import { PublicQRViewer } from './components/PublicQRViewer';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import type { ClientUser, QRCodeItem, UserSession } from './types';
import { Sparkles, CheckCircle2, AlertCircle, DownloadCloud, UploadCloud, Github } from 'lucide-react';
import {
  getLocalClients,
  saveLocalClients,
  getLocalQRCodes,
  saveLocalQRCodes,
  fallbackInitialClients,
  fallbackInitialQRCodes,
} from './utils/storage';

export default function App() {
  // Check if viewing direct public QR landing page (supports subpath, query param ?q=, and hash #/q/)
  const searchParams = new URLSearchParams(window.location.search);
  const qParam = searchParams.get('q') || searchParams.get('code');
  const hashMatch = window.location.hash.match(/#(?:view|q)\/([a-zA-Z0-9_-]+)/);
  const pathMatch = window.location.pathname.match(/(?:view|q)\/([a-zA-Z0-9_-]+)/);

  const publicShortCode = qParam || (hashMatch ? hashMatch[1] : (pathMatch ? pathMatch[1] : ''));
  const isPublicView = Boolean(publicShortCode);

  // Auth & Session
  const [currentSession, setCurrentSession] = useState<UserSession>({
    role: 'dev',
    user: {
      id: 'dev',
      name: 'Administrador Dev (Master)',
      email: 'dev@qrcode.local',
      company: 'Dev Studio / Master',
    },
  });

  // Navigation
  const [activeDevTab, setActiveDevTab] = useState<'clients' | 'control'>('control');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');

  // Data
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<ClientUser | null>(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState<QRCodeItem | null>(null);

  const [isEditDestinationOpen, setIsEditDestinationOpen] = useState(false);
  const [qrForDestinationEdit, setQrForDestinationEdit] = useState<QRCodeItem | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [qrForPreview, setQrForPreview] = useState<QRCodeItem | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [qrForPrint, setQrForPrint] = useState<QRCodeItem | null>(null);

  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [qrForAnalytics, setQrForAnalytics] = useState<QRCodeItem | null>(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorShortCode, setSimulatorShortCode] = useState<string | undefined>(undefined);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data (Hybrid: tries backend API, falls back to localStorage on static GitHub Pages)
  const loadData = async () => {
    try {
      setLoading(true);
      let loadedClients: ClientUser[] | null = null;
      let loadedQRs: QRCodeItem[] | null = null;

      try {
        const [resClients, resQRs] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/qrcodes'),
        ]);

        if (resClients.ok && resQRs.ok) {
          loadedClients = await resClients.json();
          loadedQRs = await resQRs.json();
          if (loadedClients) saveLocalClients(loadedClients);
          if (loadedQRs) saveLocalQRCodes(loadedQRs);
        }
      } catch {
        // Backend not available (e.g. static GitHub Pages host)
      }

      if (!loadedClients || loadedClients.length === 0) {
        loadedClients = getLocalClients();
      }
      if (!loadedQRs || loadedQRs.length === 0) {
        loadedQRs = getLocalQRCodes();
      }

      setClients(loadedClients || []);
      setQrcodes(loadedQRs || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPublicView) {
      loadData();
    }
  }, [isPublicView]);

  // Export / Import Backup Data for GitHub Pages
  const handleExportBackup = () => {
    const data = {
      clients: getLocalClients(),
      qrcodes: getLocalQRCodes(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-qrdinamico-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.clients && Array.isArray(json.clients)) {
          saveLocalClients(json.clients);
          setClients(json.clients);
        }
        if (json.qrcodes && Array.isArray(json.qrcodes)) {
          saveLocalQRCodes(json.qrcodes);
          setQrcodes(json.qrcodes);
        }
        showToast('Dados restaurados com sucesso a partir do backup!');
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clients Handlers
  const handleSaveClient = async (clientData: Partial<ClientUser>) => {
    let savedSuccessfully = false;

    try {
      if (clientToEdit) {
        const res = await fetch(`/api/clients/${clientToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        if (res.ok) savedSuccessfully = true;
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        if (res.ok) savedSuccessfully = true;
      }
    } catch {
      // Backend not reached, fall back to local
    }

    if (!savedSuccessfully) {
      // Local fallback for GitHub Pages
      const currentList = getLocalClients();
      if (clientToEdit) {
        const updated = currentList.map((c) =>
          c.id === clientToEdit.id ? { ...c, ...clientData, updatedAt: new Date().toISOString() } : c
        );
        saveLocalClients(updated);
        setClients(updated);
      } else {
        const newC: ClientUser = {
          id: 'client-' + Date.now().toString(36),
          name: clientData.name || '',
          company: clientData.company || clientData.name || '',
          email: clientData.email || '',
          password: clientData.password || '123456',
          phone: clientData.phone || '',
          status: clientData.status || 'active',
          maxQRCodes: clientData.maxQRCodes || 10,
          notes: clientData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newC, ...currentList];
        saveLocalClients(updated);
        setClients(updated);
      }
    }

    showToast(clientToEdit ? 'Cliente atualizado!' : 'Novo cliente cadastrado com credenciais!');
    setIsClientModalOpen(false);
    setClientToEdit(null);
    loadData();
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente e seus QR codes vinculados?')) {
      return;
    }
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir cliente.');
      showToast('Cliente removido com sucesso.');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  const handleToggleClientStatus = async (client: ClientUser) => {
    const nextStatus = client.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Falha ao alterar status.');
      showToast(`Acesso do cliente ${nextStatus === 'active' ? 'ativado' : 'desativado'}.`);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar status.');
    }
  };

  const handleImpersonateClient = (client: ClientUser) => {
    setCurrentSession({
      role: 'client',
      user: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
      },
    });
    showToast(`Visualizando painel como "${client.company}".`);
  };

  // QR Code Handlers
  const handleSaveQRCode = async (qrData: Partial<QRCodeItem>) => {
    let saved = false;

    try {
      if (qrToEdit) {
        const res = await fetch(`/api/qrcodes/${qrToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(qrData),
        });
        if (res.ok) saved = true;
      } else {
        const res = await fetch('/api/qrcodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(qrData),
        });
        if (res.ok) saved = true;
      }
    } catch {
      // Backend not available (GitHub Pages)
    }

    if (!saved) {
      const currentList = getLocalQRCodes();
      if (qrToEdit) {
        const updated = currentList.map((q) =>
          q.id === qrToEdit.id
            ? {
                ...q,
                ...qrData,
                content: { ...q.content, ...(qrData.content || {}) },
                design: { ...q.design, ...(qrData.design || {}) },
                updatedAt: new Date().toISOString(),
              }
            : q
        );
        saveLocalQRCodes(updated);
        setQrcodes(updated);
      } else {
        const short = qrData.shortCode || (qrData.mode === 'static' ? 'fixo-' : 'qr-') + Math.random().toString(36).slice(2, 7);
        const newQR: QRCodeItem = {
          id: 'qr-' + Date.now().toString(36),
          shortCode: short,
          title: qrData.title || 'Novo QR Code',
          type: qrData.type || 'wifi',
          mode: qrData.mode || 'dynamic',
          rawStaticData: qrData.rawStaticData,
          clientId: qrData.clientId || 'dev',
          clientName: qrData.clientId === 'dev' ? 'Dev Master' : (clients.find(c => c.id === qrData.clientId)?.company || 'Cliente'),
          content: qrData.content || {},
          design: qrData.design || {
            fgColor: '#000000',
            bgColor: '#ffffff',
            frame: 'simple',
            frameText: 'CONECTE AO WI-FI',
            cornerStyle: 'rounded',
            logoType: 'wifi',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalScans: 0,
          status: 'active',
          scanLogs: [],
        };
        const updated = [newQR, ...currentList];
        saveLocalQRCodes(updated);
        setQrcodes(updated);
      }
    }

    showToast(
      qrData.mode === 'static'
        ? 'QR Code Estático Permanente gerado com sucesso!'
        : 'QR Code Dinâmico Reutilizável criado com sucesso!'
    );
    loadData();
  };

  const handleSaveDestination = async (id: string, updatedContent: any) => {
    let saved = false;

    try {
      const res = await fetch(`/api/qrcodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      });
      if (res.ok) saved = true;
    } catch {
      // Backend not available (GitHub Pages)
    }

    if (!saved) {
      const currentList = getLocalQRCodes();
      const updated = currentList.map((q) =>
        q.id === id
          ? {
              ...q,
              content: { ...q.content, ...updatedContent },
              updatedAt: new Date().toISOString(),
            }
          : q
      );
      saveLocalQRCodes(updated);
      setQrcodes(updated);
    }

    showToast('✓ Destino e senha atualizados! O QR Code impresso continua funcionando perfeitamente.');
    loadData();
  };

  const handleDeleteQRCode = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este QR Code?')) {
      return;
    }

    try {
      const res = await fetch(`/api/qrcodes/${id}`, { method: 'DELETE' });
    } catch {
      // Backend not available
    }

    const currentList = getLocalQRCodes();
    const updated = currentList.filter((q) => q.id !== id);
    saveLocalQRCodes(updated);
    setQrcodes(updated);
    showToast('QR Code excluído.');
    loadData();
  };

  const handleToggleQRStatus = async (qr: QRCodeItem) => {
    const nextStatus: 'active' | 'paused' = qr.status === 'active' ? 'paused' : 'active';

    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Backend not available
    }

    const currentList = getLocalQRCodes();
    const updated: QRCodeItem[] = currentList.map((q) => (q.id === qr.id ? { ...q, status: nextStatus } : q));
    saveLocalQRCodes(updated);
    setQrcodes(updated);
    showToast(`QR Code ${nextStatus === 'active' ? 'ativado' : 'pausado'}.`);
    loadData();
  };

  // Direct Public Viewer Route (e.g. when someone scans on their phone)
  if (isPublicView) {
    return (
      <PublicQRViewer
        shortCode={publicShortCode}
        onGoHome={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  const isDev = currentSession.role === 'dev';

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto bg-slate-100 flex flex-col text-slate-800 antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        currentSession={currentSession}
        clients={clients}
        activeDevTab={activeDevTab}
        onSelectDevTab={setActiveDevTab}
        onSwitchSession={setCurrentSession}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenSimulator={() => {
          setSimulatorShortCode(undefined);
          setIsSimulatorOpen(true);
        }}
      />

      {/* Impersonation Banner if client view is active */}
      {!isDev && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <span className="font-bold">Painel do Cliente:</span>
            <span>{currentSession.user.company || currentSession.user.name}</span>
            <span className="text-emerald-200">({currentSession.user.email})</span>
            <button
              onClick={() => {
                setCurrentSession({
                  role: 'dev',
                  user: {
                    id: 'dev',
                    name: 'Administrador Dev (Master)',
                    email: 'dev@qrcode.local',
                    company: 'Dev Studio / Master',
                  },
                });
                showToast('Retornado para o Acesso Dev Master.');
              }}
              className="ml-auto underline font-bold hover:text-white"
            >
              Voltar ao Acesso Dev Master →
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 overflow-x-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Carregando central de QR Codes...</p>
          </div>
        ) : isDev && activeDevTab === 'clients' ? (
          /* Dev Tab 1: Gestão de Clientes */
          <ClientsTab
            clients={clients}
            onOpenCreateModal={() => {
              setClientToEdit(null);
              setIsClientModalOpen(true);
            }}
            onOpenEditModal={(client) => {
              setClientToEdit(client);
              setIsClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onToggleStatus={handleToggleClientStatus}
            onImpersonateClient={handleImpersonateClient}
            onSelectClientFilterInControl={(clientId) => {
              setSelectedClientFilter(clientId);
              setActiveDevTab('control');
            }}
          />
        ) : (
          /* Dev Tab 2 OR Client Panel: Sistema de Geração & Controle */
          <QRControlTab
            qrcodes={qrcodes}
            clients={clients}
            currentSession={currentSession}
            selectedClientFilter={selectedClientFilter}
            onSetClientFilter={setSelectedClientFilter}
            onOpenCreateModal={() => {
              setQrToEdit(null);
              setIsQRModalOpen(true);
            }}
            onOpenEditModal={(qr) => {
              setQrToEdit(qr);
              setIsQRModalOpen(true);
            }}
            onOpenEditDestination={(qr) => {
              setQrForDestinationEdit(qr);
              setIsEditDestinationOpen(true);
            }}
            onOpenPreviewModal={(qr) => {
              setQrForPreview(qr);
              setIsPreviewModalOpen(true);
            }}
            onOpenPrintTemplate={(qr) => {
              setQrForPrint(qr);
              setIsPrintModalOpen(true);
            }}
            onOpenAnalytics={(qr) => {
              setQrForAnalytics(qr);
              setIsAnalyticsModalOpen(true);
            }}
            onDeleteQRCode={handleDeleteQRCode}
            onToggleStatus={handleToggleQRStatus}
            onSimulateScan={(code) => {
              setSimulatorShortCode(code);
              setIsSimulatorOpen(true);
            }}
          />
        )}

        {/* Dev Master Utility Bar: Backup & GitHub Pages Helper */}
        {isDev && (
          <div className="mt-8 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">Publicação & Dados:</span>
              <button
                onClick={() => setIsGithubModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors shadow-sm"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Instruções GitHub Pages</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 transition-colors shadow-sm"
                title="Baixar arquivo JSON com todos os clientes e QR codes"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Backup JSON</span>
              </button>

              <label className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 transition-colors shadow-sm cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restaurar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          setQrToEdit(null);
        }}
        onSave={handleSaveQRCode}
        qrToEdit={qrToEdit}
        clients={clients}
        currentSession={currentSession}
      />

      <EditDestinationModal
        isOpen={isEditDestinationOpen}
        onClose={() => {
          setIsEditDestinationOpen(false);
          setQrForDestinationEdit(null);
        }}
        qrCode={qrForDestinationEdit}
        onSave={handleSaveDestination}
        onTestScan={(code) => {
          setSimulatorShortCode(code);
          setIsSimulatorOpen(true);
        }}
      />

      <QRPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setQrForPreview(null);
        }}
        qrCode={qrForPreview}
        onOpenEditDestination={(qr) => {
          setQrForDestinationEdit(qr);
          setIsEditDestinationOpen(true);
        }}
        onOpenPrintTemplate={(qr) => {
          setQrForPrint(qr);
          setIsPrintModalOpen(true);
        }}
        onSimulateScan={(code) => {
          setSimulatorShortCode(code);
          setIsSimulatorOpen(true);
        }}
      />

      <PrintTemplateModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setQrForPrint(null);
        }}
        qrCode={qrForPrint}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => {
          setIsAnalyticsModalOpen(false);
          setQrForAnalytics(null);
        }}
        qrCode={qrForAnalytics}
      />

      <MobileScanSimulator
        isOpen={isSimulatorOpen}
        onClose={() => {
          setIsSimulatorOpen(false);
          setSimulatorShortCode(undefined);
        }}
        qrcodes={qrcodes}
        initialShortCode={simulatorShortCode}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(session) => {
          setCurrentSession(session);
          showToast(`Conectado como ${session.user.name}`);
        }}
        clients={clients}
      />

      <GitHubPagesModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />
    </div>
  );
}
