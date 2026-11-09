import type { ClientUser, QRCodeItem, DatabaseSchema } from '../types';

const STORAGE_KEY_CLIENTS = 'qr_dinamico_clients_v1';
const STORAGE_KEY_QRCODES = 'qr_dinamico_qrcodes_v1';

export const fallbackInitialClients: ClientUser[] = [
  {
    id: 'client-1',
    name: 'Carlos Oliveira',
    company: 'Café & Bistrô Aromas',
    email: 'contato@cafearomas.com.br',
    password: 'cafe123',
    phone: '(11) 98765-4321',
    status: 'active',
    maxQRCodes: 10,
    notes: 'Placas de mesa impressas com QR Code do Wi-Fi e Cardápio.',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'client-2',
    name: 'Mariana Souza',
    company: 'Pousada Vila do Sol',
    email: 'reservas@viladosol.com.br',
    password: 'sol123',
    phone: '(24) 99887-1122',
    status: 'active',
    maxQRCodes: 5,
    notes: 'Trocam a senha do Wi-Fi dos hóspedes a cada início de mês.',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'client-3',
    name: 'Dra. Camila Ramos',
    company: 'Camila Ramos Odontologia',
    email: 'clinica@camilaodonto.com.br',
    password: 'odonto123',
    phone: '(11) 97123-4567',
    status: 'active',
    maxQRCodes: 5,
    notes: 'QR Code no balcão da recepção para Wi-Fi e Pix da consulta.',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  }
];

export const fallbackInitialQRCodes: QRCodeItem[] = [
  {
    id: 'qr-1',
    shortCode: 'wifi-aromas',
    title: 'Wi-Fi Clientes - Café Aromas',
    type: 'wifi',
    mode: 'dynamic',
    clientId: 'client-1',
    clientName: 'Café & Bistrô Aromas',
    content: {
      ssid: 'CafeAromas_Clientes',
      password: 'aromas-canela-2026',
      securityType: 'WPA',
      welcomeNote: 'Bem-vindo ao Café Aromas! Conecte-se e deguste o melhor grão artesanal.',
      contactSupport: 'Dúvidas? Chame um atendente no balcão.',
    },
    design: {
      fgColor: '#843d12',
      bgColor: '#fffbf5',
      frame: 'wifi',
      frameText: 'WI-FI GRÁTIS AROMAS',
      frameColor: '#843d12',
      cornerStyle: 'rounded',
      logoType: 'coffee',
    },
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    totalScans: 284,
    status: 'active',
    scanLogs: [
      { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), device: 'Apple iOS' },
      { timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), device: 'Android' },
    ],
  },
  {
    id: 'qr-2',
    shortCode: 'cardapio-aromas',
    title: 'Cardápio Digital - Café Aromas',
    type: 'url',
    mode: 'dynamic',
    clientId: 'client-1',
    clientName: 'Café & Bistrô Aromas',
    content: {
      targetUrl: 'https://example.com/cardapio-cafe-aromas',
    },
    design: {
      fgColor: '#1c1917',
      bgColor: '#ffffff',
      frame: 'cardapio',
      frameText: 'VEJA O NOSSO CARDÁPIO',
      frameColor: '#1c1917',
      cornerStyle: 'rounded',
      logoType: 'store',
    },
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    totalScans: 612,
    status: 'active',
    scanLogs: [],
  },
  {
    id: 'qr-3',
    shortCode: 'wifi-viladosol',
    title: 'Wi-Fi Hóspedes - Pousada Vila do Sol',
    type: 'wifi',
    mode: 'dynamic',
    clientId: 'client-2',
    clientName: 'Pousada Vila do Sol',
    content: {
      ssid: 'VilaDoSol_Hospedes_VIP',
      password: 'sol-e-praia-paraty',
      securityType: 'WPA',
      welcomeNote: 'Aproveite seus dias de descanso na Vila do Sol!',
      contactSupport: 'Ramal 9 para falar com a Recepção 24h.',
    },
    design: {
      fgColor: '#0369a1',
      bgColor: '#f0f9ff',
      frame: 'wifi',
      frameText: 'WI-FI HÓSPEDES VILA DO SOL',
      frameColor: '#0284c7',
      cornerStyle: 'rounded',
      logoType: 'wifi',
    },
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    totalScans: 153,
    status: 'active',
    scanLogs: [],
  },
  {
    id: 'qr-4',
    shortCode: 'link-fixo-site',
    title: 'Site Institucional Oficial (Permanente)',
    type: 'url',
    mode: 'static',
    rawStaticData: 'https://exemplo.com.br',
    clientId: 'dev',
    clientName: 'Dev Master (Administrador)',
    content: {
      targetUrl: 'https://exemplo.com.br',
    },
    design: {
      fgColor: '#334155',
      bgColor: '#ffffff',
      frame: 'simple',
      frameText: 'ACESSO DIRETO PERMANENTE',
      frameColor: '#334155',
      cornerStyle: 'square',
      logoType: 'link',
    },
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    totalScans: 45,
    status: 'active',
    scanLogs: [],
  }
];

export function getLocalClients(): ClientUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(fallbackInitialClients));
      return fallbackInitialClients;
    }
    return JSON.parse(raw);
  } catch {
    return fallbackInitialClients;
  }
}

export function saveLocalClients(clients: ClientUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed to save clients in localStorage:', err);
  }
}

export function getLocalQRCodes(): QRCodeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QRCODES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_QRCODES, JSON.stringify(fallbackInitialQRCodes));
      return fallbackInitialQRCodes;
    }
    return JSON.parse(raw);
  } catch {
    return fallbackInitialQRCodes;
  }
}

export function saveLocalQRCodes(qrcodes: QRCodeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QRCODES, JSON.stringify(qrcodes));
  } catch (err) {
    console.error('Failed to save qrcodes in localStorage:', err);
  }
}
