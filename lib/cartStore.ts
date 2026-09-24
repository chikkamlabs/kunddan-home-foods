import { useState, useSyncExternalStore } from 'react';

export interface CartItem {
  cart_item_id: string; // unique key combining product_id and variant_id
  product_id: string;
  product_name: string;
  variant_id: string;
  size: string; // weight/size
  mrp: number;
  selling_price: number;
  quantity: number;
  line_total: number;
  image_url?: string | null;
  used_in_txt?: string | null;
}

export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  subTotal: number;
  mrpTotal: number;
  savings: number;
  couponCode: string;
  couponDiscount: number;
  referralCode: string;
  totalAmount: number;
}

const CART_STORAGE_KEY = 'kunddan_cart_data_v1';
const CART_META_STORAGE_KEY = 'kunddan_cart_meta_v1';
const CART_EVENT = 'kunddan_cart_updated';

export interface CartMeta {
  couponCode: string;
  couponDiscount: number;
  referralCode: string;
}

const defaultCartMeta: CartMeta = {
  couponCode: '',
  couponDiscount: 0,
  referralCode: '',
};

// In-memory cache for useSyncExternalStore snapshot
let cachedSnapshot: CartItem[] = [];
let rawSnapshotString: string | null = null;

let cachedMetaSnapshot: CartMeta = defaultCartMeta;
let rawMetaSnapshotString: string | null = null;

function subscribeCart(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY) || '[]';
    if (raw !== rawSnapshotString) {
      rawSnapshotString = raw;
      const parsed = JSON.parse(raw);
      cachedSnapshot = Array.isArray(parsed) ? parsed : [];
    }
    return cachedSnapshot;
  } catch (err) {
    console.error('Error reading cart snapshot:', err);
    return [];
  }
}

function getCartMetaSnapshot(): CartMeta {
  if (typeof window === 'undefined') return defaultCartMeta;
  try {
    const raw = localStorage.getItem(CART_META_STORAGE_KEY) || '{}';
    if (raw !== rawMetaSnapshotString) {
      rawMetaSnapshotString = raw;
      const parsed = JSON.parse(raw);
      cachedMetaSnapshot = {
        couponCode: typeof parsed.couponCode === 'string' ? parsed.couponCode : '',
        couponDiscount: typeof parsed.couponDiscount === 'number' ? parsed.couponDiscount : 0,
        referralCode: typeof parsed.referralCode === 'string' ? parsed.referralCode : '',
      };
    }
    return cachedMetaSnapshot;
  } catch (err) {
    console.error('Error reading cart meta snapshot:', err);
    return defaultCartMeta;
  }
}

const serverSnapshot: CartItem[] = [];
function getServerSnapshot(): CartItem[] {
  return serverSnapshot;
}

function getServerMetaSnapshot(): CartMeta {
  return defaultCartMeta;
}

/**
 * Get the current cart items from localStorage.
 */
export function getCartItems(): CartItem[] {
  return getCartSnapshot();
}

/**
 * Get the current cart metadata from localStorage.
 */
export function getCartMeta(): CartMeta {
  return getCartMetaSnapshot();
}

/**
 * Save cart items to localStorage and notify listeners.
 */
export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  } catch (err) {
    console.error('Error saving cart to storage:', err);
  }
}

/**
 * Save cart metadata to localStorage and notify listeners.
 */
export function saveCartMeta(meta: Partial<CartMeta>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCartMetaSnapshot();
    const updated: CartMeta = {
      couponCode: meta.couponCode !== undefined ? meta.couponCode : current.couponCode,
      couponDiscount: meta.couponDiscount !== undefined ? meta.couponDiscount : current.couponDiscount,
      referralCode: meta.referralCode !== undefined ? meta.referralCode : current.referralCode,
    };
    localStorage.setItem(CART_META_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CART_EVENT));
  } catch (err) {
    console.error('Error saving cart meta to storage:', err);
  }
}

/**
 * Set coupon in cart metadata.
 */
export function setCartCoupon(couponCode: string, couponDiscount: number): void {
  saveCartMeta({ couponCode, couponDiscount });
}

/**
 * Set referral code in cart metadata.
 */
export function setCartReferral(referralCode: string): void {
  saveCartMeta({ referralCode });
}

/**
 * Add or increment an item in the cart.
 */
export function addToCart(item: {
  product_id: string;
  product_name: string;
  variant_id: string;
  size: string;
  mrp: number;
  selling_price: number;
  quantity: number;
  image_url?: string | null;
  used_in_txt?: string | null;
}): void {
  const currentItems = [...getCartItems()];
  const cart_item_id = `${item.product_id}_${item.variant_id}`;
  const existingIdx = currentItems.findIndex((i) => i.cart_item_id === cart_item_id);

  if (existingIdx >= 0) {
    const existing = currentItems[existingIdx];
    const newQty = existing.quantity + item.quantity;
    currentItems[existingIdx] = {
      ...existing,
      quantity: newQty,
      line_total: Number((newQty * item.selling_price).toFixed(2)),
    };
  } else {
    currentItems.push({
      cart_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      variant_id: item.variant_id,
      size: item.size,
      mrp: item.mrp,
      selling_price: item.selling_price,
      quantity: item.quantity,
      line_total: Number((item.quantity * item.selling_price).toFixed(2)),
      image_url: item.image_url,
      used_in_txt: item.used_in_txt,
    });
  }

  saveCartItems(currentItems);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kunddan_item_added', {
        detail: {
          product_name: item.product_name,
          size: item.size,
          quantity: item.quantity,
          selling_price: item.selling_price,
        },
      })
    );
  }
}

/**
 * Update the quantity of a cart item.
 */
export function updateCartItemQuantity(cart_item_id: string, newQuantity: number): void {
  let currentItems = [...getCartItems()];
  if (newQuantity <= 0) {
    currentItems = currentItems.filter((i) => i.cart_item_id !== cart_item_id);
  } else {
    currentItems = currentItems.map((i) => {
      if (i.cart_item_id === cart_item_id) {
        return {
          ...i,
          quantity: newQuantity,
          line_total: Number((newQuantity * i.selling_price).toFixed(2)),
        };
      }
      return i;
    });
  }
  saveCartItems(currentItems);
}

/**
 * Remove an item from the cart.
 */
export function removeFromCart(cart_item_id: string): void {
  const currentItems = getCartItems().filter((i) => i.cart_item_id !== cart_item_id);
  saveCartItems(currentItems);
}

/**
 * Clear all items from the cart and reset coupon metadata.
 */
export function clearCart(): void {
  saveCartItems([]);
  saveCartMeta({ couponCode: '', couponDiscount: 0, referralCode: '' });
}

/**
 * React Hook for consuming the cart in UI components.
 */
export function useCart() {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerSnapshot);
  const meta = useSyncExternalStore(subscribeCart, getCartMetaSnapshot, getServerMetaSnapshot);

  const couponCode = meta.couponCode;
  const couponDiscount = meta.couponDiscount;
  const referralCode = meta.referralCode;

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
  const subTotal = Number(items.reduce((acc, i) => acc + i.line_total, 0).toFixed(2));
  const mrpTotal = Number(items.reduce((acc, i) => acc + (i.mrp * i.quantity), 0).toFixed(2));
  const savings = Number((mrpTotal - subTotal).toFixed(2));
  const totalAmount = Math.max(0, Number((subTotal - couponDiscount).toFixed(2)));

  const setCouponCode = (code: string) => {
    saveCartMeta({ couponCode: code });
  };

  const setCouponDiscount = (discount: number) => {
    saveCartMeta({ couponDiscount: discount });
  };

  const setReferralCode = (ref: string) => {
    saveCartMeta({ referralCode: ref });
  };

  const applyCoupon = (code: string, discount: number) => {
    saveCartMeta({ couponCode: code, couponDiscount: discount });
  };

  return {
    items,
    totalQuantity,
    subTotal,
    mrpTotal,
    savings,
    couponCode,
    setCouponCode,
    couponDiscount,
    setCouponDiscount,
    applyCoupon,
    referralCode,
    setReferralCode,
    totalAmount,
    addItem: addToCart,
    updateQuantity: updateCartItemQuantity,
    removeItem: removeFromCart,
    clearCart,
  };
}
