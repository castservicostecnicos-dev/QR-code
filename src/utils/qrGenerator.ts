import QRCode from 'qrcode';
import type { QRDesign } from '../types';

export async function generateQRDataUrl(
  text: string,
  design: QRDesign,
  size = 600
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: design.fgColor || '#000000',
        light: design.bgColor || '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

export async function generateQRSvg(
  text: string,
  design: QRDesign
): Promise<string> {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      color: {
        dark: design.fgColor || '#000000',
        light: design.bgColor || '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return svgString;
  } catch (err) {
    console.error('Failed to generate QR SVG:', err);
    return '';
  }
}

// Generate raw offline Wi-Fi string according to MEBKM standard:
// WIFI:S:MySSID;T:WPA;P:MyPassword;;
export function generateRawWifiString(
  ssid: string,
  password = '',
  security: 'WPA' | 'WEP' | 'nopass' | 'WPA3' = 'WPA',
  hidden = false
): string {
  const cleanSSID = ssid.replace(/([\\;,:"])/g, '\\$1');
  const cleanPass = password.replace(/([\\;,:"])/g, '\\$1');
  const sec = security === 'nopass' ? 'nopass' : security;
  return `WIFI:S:${cleanSSID};T:${sec};P:${cleanPass};${hidden ? 'H:true;' : ''};`;
}
