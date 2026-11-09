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
import type { ClientUser, QRCodeItem, UserSession } from './types';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Check if viewing direct public QR landing page
  const pathname = window.location.pathname;
  const isPublicView = pathname.startsWith('/view/') || pathname.startsWith('/q/');
  const publicShortCode = isPublicView ? pathname.split('/')[2] || '' : '';

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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [resClients, resQRs] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/qrcodes'),
      ]);

      if (resClients.ok) {
        const cData = await resClients.json();
        setClients(cData);
      }
      if (resQRs.ok) {
        const qData = await resQRs.json();
        setQrcodes(qData);
      }
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

  // Clients Handlers
  const handleSaveClient = async (clientData: Partial<ClientUser>) => {
    try {
      if (clientToEdit) {
        const res = await fetch(`/api/clients/${clientToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        if (!res.ok) throw new Error('Falha ao atualizar cliente.');
        showToast('Dados e credenciais do cliente atualizados com sucesso!');
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Falha ao cadastrar cliente.');
        }
        showToast('Novo cliente cadastrado com credenciais ativas!');
      }

      setIsClientModalOpen(false);
      setClientToEdit(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar cliente.');
    }
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
    if (qrToEdit) {
      const res = await fetch(`/api/qrcodes/${qrToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Falha ao atualizar QR Code.');
      }
      showToast('QR Code atualizado com sucesso!');
    } else {
      const res = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Falha ao criar QR Code.');
      }
      showToast(
        qrData.mode === 'static'
          ? 'QR Code Estático Permanente gerado com sucesso!'
          : 'QR Code Dinâmico Reutilizável criado com sucesso!'
      );
    }
    loadData();
  };

  const handleSaveDestination = async (id: string, updatedContent: any) => {
    const res = await fetch(`/api/qrcodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: updatedContent }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error || 'Falha ao atualizar destino.');
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
      if (!res.ok) throw new Error('Falha ao excluir QR Code.');
      showToast('QR Code excluído.');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  const handleToggleQRStatus = async (qr: QRCodeItem) => {
    const nextStatus = qr.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Falha ao alterar status.');
      showToast(`QR Code ${nextStatus === 'active' ? 'ativado' : 'pausado'}.`);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar status.');
    }
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
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
    </div>
  );
}
