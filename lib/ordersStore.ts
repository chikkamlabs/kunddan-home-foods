import { supabase } from './supabase';
import { CartItem } from './cartStore';

export interface CheckoutFormData {
  firstName: string;
  lastName?: string;
  mobile: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  referralCode?: string;
  couponCode?: string;
  notes?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderDbId?: string;
  customerId?: string;
  error?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  mobile_number: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  city_code?: string | null;
  loyalty_points: number;
  referral_code?: string | null;
}

/**
 * Searches for an existing customer in Supabase by mobile number.
 */
export async function searchCustomerByMobile(mobile: string): Promise<CustomerRecord | null> {
  try {
    const rawMobile = mobile.trim();
    if (!rawMobile) return null;

    const digitsOnly = rawMobile.replace(/\D/g, '');
    const tenDigit = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`mobile_number.eq.${rawMobile},mobile_number.eq.${tenDigit},mobile_number.eq.+91${tenDigit}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('Error querying customer by mobile:', error.message);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.warn('Unexpected error in searchCustomerByMobile:', err);
    return null;
  }
}

/**
 * Validates or fetches active coupon from Supabase coupons table.
 */
export async function validateCoupon(couponCode: string, currentSubtotal: number): Promise<{
  valid: boolean;
  discount: number;
  message: string;
}> {
  try {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) {
      return { valid: false, discount: 0, message: 'Please enter a coupon code' };
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', trimmed)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking coupon:', error.message);
      return { valid: false, discount: 0, message: 'Could not validate coupon' };
    }

    if (!data) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    if (data.min_order && currentSubtotal < data.min_order) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of Rs. ${data.min_order} required for this coupon`,
      };
    }

    let discount = Number(data.discount) || 0;
    if (data.max_discount && discount > data.max_discount) {
      discount = data.max_discount;
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied: Rs. ${discount} OFF!`,
    };
  } catch (err) {
    console.error('Unexpected error validating coupon:', err);
    return { valid: false, discount: 0, message: 'Unexpected coupon validation error' };
  }
}

/**
 * Handles customer insertion / deduplication by mobile_number.
 * If customer with this mobile exists, returns existing customer ID.
 * Otherwise, creates a new record in `customers`.
 */
export async function findOrCreateCustomer(data: CheckoutFormData): Promise<string | null> {
  try {
    const cleanMobile = data.mobile.trim();
    const fullName = [data.firstName.trim(), data.lastName?.trim()].filter(Boolean).join(' ') || 'Valued Customer';

    // 1. Check if customer exists by mobile_number
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('id')
      .eq('mobile_number', cleanMobile)
      .maybeSingle();

    if (findError) {
      console.warn('Error querying customers table:', findError.message);
    }

    if (existingCustomer?.id) {
      return existingCustomer.id;
    }

    // 2. Generate unique key for customer
    const customerKey = `cust_${cleanMobile}_${Date.now()}`;

    // 3. Insert new customer
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        name: fullName,
        mobile_number: cleanMobile,
        email: data.email?.trim() || null,
        address: data.addressLine1.trim(),
        city: data.city.trim(),
        city_code: data.postalCode.trim(),
        referral_code: data.referralCode?.trim() || null,
        key: customerKey,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting customer:', insertError.message);
      return null;
    }

    return newCustomer?.id || null;
  } catch (err) {
    console.error('Unexpected error in findOrCreateCustomer:', err);
    return null;
  }
}

/**
 * Generates an Order ID in the format ORD-yymmdd-101 (+1 on every new order).
 */
export async function generateNextOrderId(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`;
  const prefix = `ORD-${dateKey}-`;

  let nextSequence = 101;

  try {
    const { data: existingOrders, error } = await supabase
      .from('orders')
      .select('order_id')
      .ilike('order_id', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && existingOrders && existingOrders.length > 0) {
      let maxSeq = 100;
      for (const ord of existingOrders) {
        if (ord.order_id && ord.order_id.startsWith(prefix)) {
          const suffix = ord.order_id.slice(prefix.length);
          const num = parseInt(suffix, 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
      nextSequence = maxSeq + 1;
    }
  } catch (err) {
    console.warn('Could not fetch existing orders for sequence generation:', err);
  }

  // Backup sync via localStorage if window is defined
  if (typeof window !== 'undefined') {
    const localSeqKey = `kunddan_last_order_seq_${dateKey}`;
    const localStored = parseInt(localStorage.getItem(localSeqKey) || '0', 10);
    if (localStored >= nextSequence) {
      nextSequence = localStored + 1;
    }
    localStorage.setItem(localSeqKey, String(nextSequence));
  }

  return `${prefix}${nextSequence}`;
}

/**
 * Creates an order, customer (if not exists), updates loyalty points, and inserts order_items in Supabase.
 */
export async function createOrder(
  formData: CheckoutFormData,
  items: CartItem[],
  subTotal: number,
  discount: number,
  totalAmount: number
): Promise<CreateOrderResult> {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    const cleanMobile = formData.mobile.trim();
    const fullName = [formData.firstName.trim(), formData.lastName?.trim()].filter(Boolean).join(' ') || 'Valued Customer';

    // 1. Validate coupon if provided
    let finalCouponCode: string | null = null;
    let finalDiscount = 0;

    if (formData.couponCode && formData.couponCode.trim()) {
      const couponCheck = await validateCoupon(formData.couponCode, subTotal);
      if (couponCheck.valid) {
        finalCouponCode = formData.couponCode.trim().toUpperCase();
        finalDiscount = couponCheck.discount;
      }
    } else if (discount > 0) {
      finalDiscount = discount;
    }

    const finalTotalAmount = Math.max(0, Number((subTotal - finalDiscount).toFixed(2)));
    const finalReferralCode = formData.referralCode?.trim() || null;

    // 2. Loyalty Points: totalAmount / 100
    const pointsEarned = Number((finalTotalAmount / 100).toFixed(2));

    // 3. Find or Create Customer and update loyalty_points if existing
    let customerId: string | null = null;
    const digitsOnly = cleanMobile.replace(/\D/g, '');
    const tenDigit = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    const { data: customerList, error: findError } = await supabase
      .from('customers')
      .select('id, loyalty_points, name, email, address, city, city_code, referral_code, key')
      .or(`mobile_number.eq.${cleanMobile},mobile_number.eq.${tenDigit},mobile_number.eq.+91${tenDigit}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError) {
      console.warn('Error querying customers for loyalty points:', findError.message);
    }

    const existingCustomer = customerList && customerList.length > 0 ? customerList[0] : null;

    if (existingCustomer?.id) {
      customerId = existingCustomer.id;
      const currentPoints = parseFloat(String(existingCustomer.loyalty_points ?? '0')) || 0;
      const updatedPoints = Number((currentPoints + pointsEarned).toFixed(2));

      const { error: updateCustErr } = await supabase
        .from('customers')
        .update({
          loyalty_points: updatedPoints,
          name: fullName || existingCustomer.name,
          email: formData.email?.trim() || existingCustomer.email || null,
          address: formData.addressLine1.trim() || existingCustomer.address || null,
          city: formData.city.trim() || existingCustomer.city || null,
          city_code: formData.postalCode.trim() || existingCustomer.city_code || null,
          referral_code: finalReferralCode || existingCustomer.referral_code || null,
        })
        .eq('id', existingCustomer.id);

      if (updateCustErr) {
        console.warn('Error updating customer loyalty points:', updateCustErr.message);
      }
    } else {
      const keySuffix = tenDigit.slice(-4) || '1001';
      const customerKey = `KND-${keySuffix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: newCustomer, error: insertCustErr } = await supabase
        .from('customers')
        .insert({
          name: fullName,
          mobile_number: cleanMobile,
          email: formData.email?.trim() || null,
          address: formData.addressLine1.trim(),
          city: formData.city.trim(),
          city_code: formData.postalCode.trim(),
          loyalty_points: pointsEarned,
          referral_code: finalReferralCode,
          key: customerKey,
        })
        .select('id')
        .single();

      if (insertCustErr) {
        console.warn('Error inserting new customer:', insertCustErr.message);
      } else if (newCustomer) {
        customerId = newCustomer.id;
      }
    }

    // 4. Generate unique order_id in ORD-yymmdd-101 format
    const orderId = await generateNextOrderId();
    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

    // 5. Insert into `orders`
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        items_quantity: totalQuantity,
        amount: finalTotalAmount,
        sub_total: subTotal,
        discount: finalDiscount,
        referral_code: finalReferralCode,
        coupon_code: finalCouponCode,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName?.trim() || null,
        email: formData.email?.trim() || null,
        mobile: cleanMobile,
        address_line1: formData.addressLine1.trim(),
        address_line2: null, // Don't ask landmark/Area
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postalCode.trim(),
        status: 'pending',
      })
      .select('id, order_id')
      .single();

    if (orderError) {
      console.error('Error creating order in Supabase:', orderError.message);
      return { success: false, error: orderError.message };
    }

    const orderDbId = orderData.id;

    // 6. Insert into `order_items`
    const orderItemsToInsert = items.map((item) => ({
      order_id: orderDbId,
      product_id: item.product_id,
      product_variant_id: item.variant_id,
      mrp: item.mrp,
      price: item.selling_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Error inserting order_items in Supabase:', itemsError.message);
    }

    return {
      success: true,
      orderId: orderData.order_id,
      orderDbId: orderDbId,
      customerId: customerId || undefined,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unexpected order processing error';
    console.error('Unexpected error in createOrder:', err);
    return { success: false, error: errorMsg };
  }
}
