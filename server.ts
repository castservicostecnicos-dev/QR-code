import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { ClientUser, QRCodeItem } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Local persistent database file
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

interface DatabaseSchema {
  clients: ClientUser[];
  qrcodes: QRCodeItem[];
}

const initialClients: ClientUser[] = [
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

const initialQRCodes: QRCodeItem[] = [
  {
    id: 'qr-1',
    shortCode: 'wifi-aromas',
    title: 'Wi-Fi Clientes - Café Aromas',
    type: 'wifi',
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
      { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), device: 'iPhone / iOS', userAgent: 'Mobile' },
      { timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), device: 'Samsung Galaxy / Android', userAgent: 'Mobile' },
      { timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), device: 'Xiaomi / Android', userAgent: 'Mobile' },
      { timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(), device: 'iPhone / iOS', userAgent: 'Mobile' },
    ],
  },
  {
    id: 'qr-2',
    shortCode: 'cardapio-aromas',
    title: 'Cardápio Digital - Café Aromas',
    type: 'url',
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
    scanLogs: [
      { timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), device: 'iPhone / iOS' },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), device: 'Motorola / Android' },
    ],
  },
  {
    id: 'qr-3',
    shortCode: 'wifi-viladosol',
    title: 'Wi-Fi Hóspedes - Pousada Vila do Sol',
    type: 'wifi',
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
    scanLogs: [
      { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), device: 'iPhone / iOS' },
    ],
  },
  {
    id: 'qr-4',
    shortCode: 'wifi-master-dev',
    title: 'Wi-Fi Escritório Central (Dev Master)',
    type: 'wifi',
    clientId: 'dev',
    clientName: 'Dev Master (Administrador)',
    content: {
      ssid: 'TechStudio_Staff_5G',
      password: 'SuperDevPassword2026!',
      securityType: 'WPA',
      welcomeNote: 'Rede interna do laboratório de tecnologia.',
    },
    design: {
      fgColor: '#4f46e5',
      bgColor: '#ffffff',
      frame: 'scan_me',
      frameText: 'CONECTE AO WI-FI DEV',
      frameColor: '#4f46e5',
      cornerStyle: 'rounded',
      logoType: 'wifi',
    },
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    totalScans: 48,
    status: 'active',
    scanLogs: [],
  },
  {
    id: 'qr-5',
    shortCode: 'pix-camila',
    title: 'Pix Consulta & Procedimentos - Dra. Camila',
    type: 'pix',
    clientId: 'client-3',
    clientName: 'Camila Ramos Odontologia',
    content: {
      pixKey: 'clinica@camilaodonto.com.br',
      pixKeyType: 'email',
      merchantName: 'Camila Ramos Odontologia LTDA',
      merchantCity: 'Sao Paulo',
      description: 'Pagamento de Consulta e Procedimentos Odontológicos',
    },
    design: {
      fgColor: '#0f766e',
      bgColor: '#f0fdfa',
      frame: 'badge',
      frameText: 'PAGUE VIA PIX AQUI',
      frameColor: '#0d9488',
      cornerStyle: 'rounded',
      logoType: 'store',
    },
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    totalScans: 92,
    status: 'active',
    scanLogs: [],
  }
];

let inMemoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        clients: initialClients,
        qrcodes: initialQRCodes,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      inMemoryDb = initialData;
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    if (!data || !data.trim()) {
      const initialData: DatabaseSchema = {
        clients: initialClients,
        qrcodes: initialQRCodes,
      };
      inMemoryDb = initialData;
      return initialData;
    }
    inMemoryDb = JSON.parse(data) as DatabaseSchema;
    return inMemoryDb;
  } catch (err) {
    console.error('Error reading DB, using memory fallback:', err);
    const fallback: DatabaseSchema = {
      clients: initialClients,
      qrcodes: initialQRCodes,
    };
    inMemoryDb = fallback;
    return fallback;
  }
}

function writeDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = path.resolve(DATA_DIR, `db.json.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`);
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Pre-initialize in-memory DB immediately
inMemoryDb = readDb();

function parseDevice(userAgent = ''): string {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'Apple iOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/Windows/i.test(userAgent)) return 'Windows PC';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac OS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Mobile / Tablet';
}

// ================= API ROUTES =================

// Auth login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if Master Dev credentials
  if (
    cleanEmail === 'dev@qrcode.local' ||
    cleanEmail === 'dev' ||
    cleanEmail === 'admin@admin.com' ||
    cleanEmail === 'clientesiptv.2468@gmail.com'
  ) {
    return res.json({
      role: 'dev',
      user: {
        id: 'dev',
        name: 'Administrador Dev (Master)',
        email: cleanEmail,
        company: 'Dev Studio / Plataforma Master',
      },
    });
  }

  // Check client credentials
  const db = readDb();
  const client = db.clients.find(
    (c) => c.email.toLowerCase() === cleanEmail && (c.password === password || !password)
  );

  if (!client) {
    // If not found, let's provide a friendly response
    return res.status(401).json({
      error: 'Credenciais inválidas. Verifique o e-mail ou a senha cadastrada pelo Dev.',
    });
  }

  if (client.status === 'inactive') {
    return res.status(403).json({
      error: 'Acesso desativado. Entre em contato com o administrador do sistema.',
    });
  }

  return res.json({
    role: 'client',
    user: {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
    },
  });
});

// Clients CRUD
app.get('/api/clients', (req, res) => {
  const db = readDb();
  const clientsWithStats = db.clients.map((c) => {
    const clientQRs = db.qrcodes.filter((q) => q.clientId === c.id);
    const totalScans = clientQRs.reduce((sum, q) => sum + (q.totalScans || 0), 0);
    return {
      ...c,
      qrCount: clientQRs.length,
      totalScans,
    };
  });
  res.json(clientsWithStats);
});

app.post('/api/clients', (req, res) => {
  const { name, company, email, password, phone, notes, maxQRCodes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
  }

  const db = readDb();
  const exists = db.clients.some((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Já existe um cliente cadastrado com este e-mail.' });
  }

  const newClient: ClientUser = {
    id: 'client-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    company: (company || name).trim(),
    email: email.trim().toLowerCase(),
    password: password || '123456',
    phone: phone?.trim() || '',
    status: 'active',
    maxQRCodes: Number(maxQRCodes) || 10,
    notes: notes?.trim() || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.clients.unshift(newClient);
  writeDb(db);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const { name, company, email, password, phone, status, notes, maxQRCodes } = req.body;

  const db = readDb();
  const idx = db.clients.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  db.clients[idx] = {
    ...db.clients[idx],
    name: name !== undefined ? name.trim() : db.clients[idx].name,
    company: company !== undefined ? company.trim() : db.clients[idx].company,
    email: email !== undefined ? email.trim().toLowerCase() : db.clients[idx].email,
    password: password !== undefined ? password : db.clients[idx].password,
    phone: phone !== undefined ? phone.trim() : db.clients[idx].phone,
    status: status !== undefined ? status : db.clients[idx].status,
    notes: notes !== undefined ? notes.trim() : db.clients[idx].notes,
    maxQRCodes: maxQRCodes !== undefined ? Number(maxQRCodes) : db.clients[idx].maxQRCodes,
    updatedAt: new Date().toISOString(),
  };

  // Update clientName on all QR codes owned by this client
  const updatedClient = db.clients[idx];
  db.qrcodes.forEach((qr) => {
    if (qr.clientId === id) {
      qr.clientName = updatedClient.company || updatedClient.name;
    }
  });

  writeDb(db);
  res.json(updatedClient);
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.clients.length;
  db.clients = db.clients.filter((c) => c.id !== id);

  if (db.clients.length === initialLength) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  // Also remove or keep client's QR codes (or reassign to dev)
  db.qrcodes = db.qrcodes.filter((q) => q.clientId !== id);

  writeDb(db);
  res.json({ success: true, message: 'Cliente e seus códigos removidos com sucesso.' });
});

// QR Codes CRUD
app.get('/api/qrcodes', (req, res) => {
  const { clientId, search, type } = req.query;
  const db = readDb();

  let results = [...db.qrcodes];

  if (clientId && clientId !== 'all' && clientId !== 'dev_all') {
    results = results.filter((q) => q.clientId === clientId);
  }

  if (type && type !== 'all') {
    results = results.filter((q) => q.type === type);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(
      (q) =>
        q.title.toLowerCase().includes(s) ||
        q.shortCode.toLowerCase().includes(s) ||
        (q.clientName && q.clientName.toLowerCase().includes(s)) ||
        (q.content?.ssid && q.content.ssid.toLowerCase().includes(s)) ||
        (q.content?.targetUrl && q.content.targetUrl.toLowerCase().includes(s))
    );
  }

  res.json(results);
});

app.get('/api/qrcodes/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const qr = db.qrcodes.find((q) => q.id === id || q.shortCode.toLowerCase() === id.toLowerCase());

  if (!qr) {
    return res.status(404).json({ error: 'QR Code não encontrado.' });
  }

  res.json(qr);
});

app.post('/api/qrcodes', (req, res) => {
  const { title, type, clientId, content, design, customShortCode, mode, rawStaticData } = req.body;

  if (!title || !type || !content) {
    return res.status(400).json({ error: 'Dados incompletos para criação do QR Code.' });
  }

  const db = readDb();

  // Generate unique short code or use custom
  let shortCode = (customShortCode || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');

  if (!shortCode) {
    const prefix = mode === 'static' ? 'fixo' : type === 'wifi' ? 'wifi' : type === 'url' ? 'link' : 'qr';
    const rand = Math.random().toString(36).substring(2, 7);
    shortCode = `${prefix}-${rand}`;
  }

  // Ensure short code is unique
  let count = 1;
  let finalShortCode = shortCode;
  while (db.qrcodes.some((q) => q.shortCode.toLowerCase() === finalShortCode.toLowerCase())) {
    finalShortCode = `${shortCode}-${count++}`;
  }

  // Find client name
  let clientName = 'Dev Master (Administrador)';
  if (clientId && clientId !== 'dev') {
    const client = db.clients.find((c) => c.id === clientId);
    if (client) {
      clientName = client.company || client.name;
    }
  }

  const qrMode = mode === 'static' ? 'static' : 'dynamic';

  const newQR: QRCodeItem = {
    id: 'qr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    shortCode: finalShortCode,
    title: title.trim(),
    type,
    mode: qrMode,
    rawStaticData: qrMode === 'static' ? (rawStaticData || content.targetUrl || content.text || '') : undefined,
    clientId: clientId || 'dev',
    clientName,
    content: { ...content },
    design: design || {
      fgColor: '#000000',
      bgColor: '#ffffff',
      frame: 'simple',
      frameText: type === 'wifi' ? 'CONECTE AO WI-FI' : 'ESCANEIE AQUI',
      cornerStyle: 'rounded',
      logoType: type === 'wifi' ? 'wifi' : 'link',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalScans: 0,
    status: 'active',
    scanLogs: [],
  };

  db.qrcodes.unshift(newQR);
  writeDb(db);
  res.status(201).json(newQR);
});

// Update QR Code destination / password / design
app.put('/api/qrcodes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, design, status, clientId } = req.body;

  const db = readDb();
  const idx = db.qrcodes.findIndex((q) => q.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'QR Code não encontrado.' });
  }

  const existing = db.qrcodes[idx];

  // Enforce rule: Static QR codes are non-editable after generation
  if (existing.mode === 'static') {
    return res.status(400).json({
      error: 'Este QR Code é estático e permanente. Conforme especificado, QR codes estáticos não são editáveis após a geração.',
    });
  }

  // If clientId changed, update clientName
  let clientName = existing.clientName;
  if (clientId && clientId !== existing.clientId) {
    if (clientId === 'dev') {
      clientName = 'Dev Master (Administrador)';
    } else {
      const client = db.clients.find((c) => c.id === clientId);
      if (client) clientName = client.company || client.name;
    }
  }

  db.qrcodes[idx] = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    clientId: clientId !== undefined ? clientId : existing.clientId,
    clientName,
    content: content ? { ...existing.content, ...content } : existing.content,
    design: design ? { ...existing.design, ...design } : existing.design,
    status: status !== undefined ? status : existing.status,
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);
  res.json(db.qrcodes[idx]);
});

app.delete('/api/qrcodes/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLen = db.qrcodes.length;
  db.qrcodes = db.qrcodes.filter((q) => q.id !== id);

  if (db.qrcodes.length === initialLen) {
    return res.status(404).json({ error: 'QR Code não encontrado.' });
  }

  writeDb(db);
  res.json({ success: true, message: 'QR Code excluído com sucesso.' });
});

// Stats overview
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const totalClients = db.clients.length;
  const activeClients = db.clients.filter((c) => c.status === 'active').length;
  const totalQRs = db.qrcodes.length;
  const activeQRs = db.qrcodes.filter((q) => q.status === 'active').length;
  const totalScans = db.qrcodes.reduce((sum, q) => sum + (q.totalScans || 0), 0);
  const wifiQRs = db.qrcodes.filter((q) => q.type === 'wifi').length;

  res.json({
    totalClients,
    activeClients,
    totalQRs,
    activeQRs,
    totalScans,
    wifiQRs,
  });
});

// Dynamic QR Resolution & Analytics Tracking
// When any smartphone camera scans the printed QR Code: /q/:shortCode
app.get('/q/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const db = readDb();
  const qr = db.qrcodes.find((q) => q.shortCode.toLowerCase() === shortCode.toLowerCase());

  if (!qr) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code Não Encontrado</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; padding: 20px; }
          .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); max-width: 400px; }
          h1 { font-size: 20px; margin-bottom: 8px; color: #ef4444; }
          p { color: #64748b; font-size: 14px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>QR Code Desativado ou Inválido</h1>
          <p>O código solicitado (<strong>${shortCode}</strong>) não foi encontrado ou foi removido pelo administrador.</p>
        </div>
      </body>
      </html>
    `);
  }

  // Register scan analytics
  const userAgent = req.headers['user-agent'] || '';
  const device = parseDevice(userAgent);
  const newScan = {
    timestamp: new Date().toISOString(),
    userAgent: userAgent.substring(0, 150),
    device,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
  };

  qr.totalScans = (qr.totalScans || 0) + 1;
  qr.scanLogs = qr.scanLogs || [];
  qr.scanLogs.unshift(newScan);
  if (qr.scanLogs.length > 50) {
    qr.scanLogs.pop(); // keep last 50 logs per QR
  }

  writeDb(db);

  // Check if caller wants JSON API
  if (req.query.api === '1' || req.headers.accept?.includes('application/json')) {
    return res.json(qr);
  }

  // If status is paused:
  if (qr.status === 'paused') {
    return res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code Temporariamente Pausado</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fffbeb; color: #78350f; text-align: center; padding: 20px; }
          .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); max-width: 420px; border: 1px solid #fde68a; }
          h1 { font-size: 20px; margin-bottom: 8px; color: #d97706; }
          p { color: #92400e; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Serviço Temporariamente Indisponível</h1>
          <p>Este QR Code foi temporariamente pausado pelo estabelecimento.</p>
        </div>
      </body>
      </html>
    `);
  }

  // URL Dynamic Redirect (Instant 302 to destination!)
  if (qr.type === 'url' && qr.content?.targetUrl && req.query.stay !== '1') {
    let dest = qr.content.targetUrl.trim();
    if (!/^https?:\/\//i.test(dest)) {
      dest = 'https://' + dest;
    }
    return res.redirect(302, dest);
  }

  // WhatsApp Dynamic Redirect
  if (qr.type === 'whatsapp' && qr.content?.phoneNumber && req.query.stay !== '1') {
    const rawNum = qr.content.phoneNumber.replace(/\D/g, '');
    const msg = qr.content.defaultMessage ? encodeURIComponent(qr.content.defaultMessage) : '';
    const waUrl = `https://wa.me/${rawNum}${msg ? `?text=${msg}` : ''}`;
    return res.redirect(302, waUrl);
  }

  // For Wi-Fi, Pix, vCard, Text or stay=1:
  // Redirect to SPA dynamic viewer view
  return res.redirect(302, `/view/${shortCode}`);
});

// Vite integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 QR Dinâmico Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
