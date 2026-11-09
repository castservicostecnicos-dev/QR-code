// Generates EMV-compliant PIX string for Copia e Cola
export function generatePixPayload(
  pixKey: string,
  merchantName: string,
  merchantCity = 'SAO PAULO',
  amount?: string,
  txid = '***'
): string {
  const cleanKey = pixKey.trim();
  const cleanName = merchantName.trim().substring(0, 25).toUpperCase();
  const cleanCity = merchantCity.trim().substring(0, 15).toUpperCase();

  function formatField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  // Account information (Tag 26)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const accountInfo = formatField('26', `${gui}${keyField}`);

  // Base fields
  let payload =
    formatField('00', '01') + // Payload Format Indicator
    accountInfo +
    formatField('52', '0000') + // Merchant Category Code
    formatField('53', '986') + // Transaction Currency (986 = BRL)
    (amount && parseFloat(amount) > 0
      ? formatField('54', parseFloat(amount).toFixed(2))
      : '') +
    formatField('58', 'BR') + // Country Code
    formatField('59', cleanName || 'RECEBEDOR') + // Merchant Name
    formatField('60', cleanCity || 'CIDADE') + // Merchant City
    formatField('62', formatField('05', txid || '***')) + // Additional Data Field (txid)
    '6304'; // CRC16 indicator

  // CRC16 Calculation (CCITT-FALSE)
  function crc16(data: string): string {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  const checksum = crc16(payload);
  return `${payload}${checksum}`;
}
