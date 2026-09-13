import { CartItem } from './cartStore';

export interface CustomerOrderData {
  orderId: string;
  firstName: string;
  lastName?: string;
  mobile: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  items: CartItem[];
  subTotal: number;
  discount?: number;
  totalAmount: number;
  referralCode?: string;
  couponCode?: string;
  notes?: string;
}

export const WHATSAPP_PHONE_NUMBER = '919398965589'; // India standard format for 9398965589

/**
 * Generates a clean, beautifully formatted WhatsApp order message.
 */
export function generateWhatsAppOrderMessage(data: CustomerOrderData): string {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
  const fullAddress = [
    data.addressLine1,
    data.addressLine2,
    data.city,
    data.state,
    data.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const itemsList = data.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product_name}* (${item.size})\n   Qty: ${item.quantity} x Rs.${item.selling_price} = *Rs.${item.line_total}*`
    )
    .join('\n\n');

  const discountText = data.discount && data.discount > 0
    ? `\n💰 *Discount:* -Rs.${data.discount} ${data.couponCode ? `(${data.couponCode})` : ''}`
    : '';

  const referralText = data.referralCode ? `\n🤝 *Referral Code:* ${data.referralCode}` : '';
  const notesText = data.notes ? `\n📝 *Notes:* ${data.notes}` : '';

  return (
`*NEW ORDER - KUNDDAN HOME FOODS*
----------------------------------------
🏷️ *Order ID:* #${data.orderId}
👤 *Customer:* ${fullName}
📞 *Mobile:* ${data.mobile}
${data.email ? `✉️ *Email:* ${data.email}\n` : ''}📍 *Delivery Address:*
${fullAddress}
----------------------------------------
🛒 *ITEMS ORDERED:*

${itemsList}
----------------------------------------
🧾 *Subtotal:* Rs.${data.subTotal}${discountText}${referralText}${notesText}
✨ *TOTAL AMOUNT:* *Rs.${data.totalAmount}*
----------------------------------------
Please confirm my order and share delivery / payment details. Thank you!`
  );
}

/**
 * Builds the WhatsApp deep link or web link.
 */
export function getWhatsAppOrderUrl(data: CustomerOrderData): string {
  const message = generateWhatsAppOrderMessage(data);
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp in a new window/tab or native app.
 */
export function openWhatsAppOrder(data: CustomerOrderData): void {
  const url = getWhatsAppOrderUrl(data);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}
