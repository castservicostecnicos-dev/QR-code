import type { VCardContent } from '../types';

export function generateVCardString(card: VCardContent): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.fullName || 'Contato'}`,
    `N:${card.fullName || 'Contato'};;;;`,
  ];

  if (card.organization) {
    lines.push(`ORG:${card.organization}`);
  }
  if (card.jobTitle) {
    lines.push(`TITLE:${card.jobTitle}`);
  }
  if (card.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${card.phone}`);
  }
  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.email}`);
  }
  if (card.website) {
    lines.push(`URL:${card.website}`);
  }
  if (card.address) {
    lines.push(`ADR;TYPE=WORK:;;${card.address};;;;`);
  }
  if (card.bio) {
    lines.push(`NOTE:${card.bio}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(card: VCardContent): void {
  const vcfData = generateVCardString(card);
  const blob = new Blob([vcfData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `${(card.fullName || 'contato').toLowerCase().replace(/\s+/g, '_')}.vcf`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
