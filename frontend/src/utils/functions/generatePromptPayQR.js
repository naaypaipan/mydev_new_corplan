/**
 * Generate a PromptPay QR payload string following the EMVCo QR standard
 * used by Thai banking (Bank of Thailand / PromptPay specification).
 *
 * @param {string} target  - PromptPay ID: phone number (10 digits) or national ID (13 digits)
 * @param {number} [amount] - Transaction amount in THB (omit for open amount)
 * @returns {string} The full EMVCo payload string (ready to encode as QR)
 */

const PROMPTPAY_AID = 'A000000677010111';

function tlv(tag, value) {
  const len = String(value.length).padStart(2, '0');
  return tag + len + value;
}

function formatTarget(target) {
  const sanitized = target.replace(/[^0-9]/g, '');

  if (sanitized.length === 13) {
    return tlv('02', sanitized);
  }

  if (sanitized.length === 10) {
    const phone = '0066' + sanitized.substring(1);
    return tlv('01', phone);
  }

  return tlv('02', sanitized);
}

function crc16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export default function generatePromptPayQR(target, amount) {
  if (!target) return '';

  const merchantAccountInfo =
    tlv('00', PROMPTPAY_AID) + formatTarget(target);

  let payload = '';
  payload += tlv('00', '01');
  payload += tlv('01', amount ? '12' : '11');
  payload += tlv('29', merchantAccountInfo);
  payload += tlv('53', '764');

  if (amount != null && amount > 0) {
    payload += tlv('54', amount.toFixed(2));
  }

  payload += tlv('58', 'TH');

  payload += '6304';
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}
