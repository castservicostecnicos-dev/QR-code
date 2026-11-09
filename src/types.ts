export type QRCodeType = 'wifi' | 'url' | 'whatsapp' | 'pix' | 'vcard' | 'text';

export interface WifiContent {
  ssid: string;
  password?: string;
  securityType: 'WPA' | 'WEP' | 'nopass' | 'WPA3';
  hidden?: boolean;
  welcomeNote?: string;
  contactSupport?: string;
}

export interface UrlContent {
  targetUrl: string;
}

export interface WhatsappContent {
  phoneNumber: string;
  defaultMessage?: string;
}

export interface PixContent {
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  merchantName: string;
  merchantCity?: string;
  amount?: string;
  description?: string;
}

export interface VCardContent {
  fullName: string;
  jobTitle?: string;
  organization?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  bio?: string;
}

export interface TextContent {
  title?: string;
  text: string;
}

export type QRContent = 
  | ({ type: 'wifi' } & WifiContent)
  | ({ type: 'url' } & UrlContent)
  | ({ type: 'whatsapp' } & WhatsappContent)
  | ({ type: 'pix' } & PixContent)
  | ({ type: 'vcard' } & VCardContent)
  | ({ type: 'text' } & TextContent);

export interface QRDesign {
  fgColor: string;
  bgColor: string;
  frame: 'none' | 'simple' | 'badge' | 'wifi' | 'scan_me' | 'cardapio';
  frameText?: string;
  frameColor?: string;
  cornerStyle?: 'square' | 'rounded';
  logoType?: 'none' | 'wifi' | 'link' | 'whatsapp' | 'store' | 'coffee';
}

export interface ScanLog {
  timestamp: string;
  userAgent?: string;
  device?: string;
  ip?: string;
}

export interface QRCodeItem {
  id: string;
  shortCode: string;
  customShortCode?: string;
  title: string;
  type: QRCodeType;
  mode?: 'dynamic' | 'static'; // Dynamic (editable/reusable) or Static (permanent/fixed)
  rawStaticData?: string; // Directly encoded text/link for static QR codes
  clientId: string; // 'dev' for master or client ID
  clientName?: string;
  content: {
    // WiFi
    ssid?: string;
    password?: string;
    securityType?: 'WPA' | 'WEP' | 'nopass' | 'WPA3';
    hidden?: boolean;
    welcomeNote?: string;
    contactSupport?: string;

    // URL
    targetUrl?: string;

    // WhatsApp
    phoneNumber?: string;
    defaultMessage?: string;

    // Pix
    pixKey?: string;
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    merchantName?: string;
    merchantCity?: string;
    amount?: string;
    description?: string;

    // vCard
    fullName?: string;
    jobTitle?: string;
    organization?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    bio?: string;

    // Text
    text?: string;
  };
  design: QRDesign;
  createdAt: string;
  updatedAt: string;
  totalScans: number;
  status: 'active' | 'paused';
  scanLogs: ScanLog[];
}

export interface ClientUser {
  id: string;
  name: string;
  company: string;
  email: string;
  password?: string;
  phone?: string;
  status: 'active' | 'inactive';
  maxQRCodes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  qrCount?: number;
  totalScans?: number;
}

export interface UserSession {
  role: 'dev' | 'client';
  user: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
}
