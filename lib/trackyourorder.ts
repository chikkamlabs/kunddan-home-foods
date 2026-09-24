import { supabase } from './supabase';

export interface TrackedOrderItem {
  id: string;
  product_name: string;
  size?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url?: string | null;
}

export interface TrackedOrderDetails {
  id: string;
  order_id: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer: {
    first_name: string;
    last_name?: string | null;
    full_name: string;
    mobile: string;
    email?: string | null;
  };
  address: {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  pricing: {
    sub_total: number;
    discount: number;
    coupon_code?: string | null;
    referral_code?: string | null;
    amount: number;
    items_quantity: number;
  };
  items: TrackedOrderItem[];
  notes?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery_date?: string | null;
}

export interface CustomerAccount {
  id: string;
  name: string;
  mobile_number: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  city_code?: string | null;
  loyalty_points: number;
  referral_code?: string | null;
  key: string;
  created_at: string;
}

export interface CustomerOrderSummary {
  id: string;
  order_id: string;
  created_at: string;
  status: string;
  amount: number;
  items_quantity: number;
  sub_total: number;
  discount: number;
}

export interface OrderItemSimple {
  name: string;
  size?: string;
  quantity: number;
}

/**
 * Enriches raw order_items with product names and variant sizes from schemas.sql tables.
 */
async function enrichOrderItems(rawItems: any[]): Promise<TrackedOrderItem[]> {
  if (!rawItems || rawItems.length === 0) return [];

  const productIds = Array.from(
    new Set(rawItems.map((i) => i.product_id).filter(Boolean))
  ) as string[];
  const variantIds = Array.from(
    new Set(rawItems.map((i) => i.product_variant_id).filter(Boolean))
  ) as string[];

  const productsMap = new Map<string, { name: string; image_url?: string | null }>();
  if (productIds.length > 0) {
    const { data: productsData, error: pErr } = await supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', productIds);
    if (!pErr && productsData) {
      productsData.forEach((p) => productsMap.set(p.id, p));
    }
  }

  const variantsMap = new Map<string, { size: string; selling_price?: number; mrp?: number }>();
  if (variantIds.length > 0) {
    const { data: variantsData, error: vErr } = await supabase
      .from('product_variants')
      .select('id, size, selling_price, mrp')
      .in('id', variantIds);
    if (!vErr && variantsData) {
      variantsData.forEach((v) => variantsMap.set(v.id, v));
    }
  }

  return rawItems.map((item) => {
    const product = item.product_id ? productsMap.get(item.product_id) : null;
    const variant = item.product_variant_id ? variantsMap.get(item.product_variant_id) : null;

    const productName = item.product_name || product?.name || 'Homemade Delicacy';
    const size = item.size || variant?.size || null;
    const unitPrice = Number(
      item.price ?? item.unit_price ?? item.mrp ?? variant?.selling_price ?? variant?.mrp ?? 0
    );
    const quantity = Number(item.quantity) || 1;
    const lineTotal = Number(item.line_total ?? unitPrice * quantity);
    const imageUrl = item.image_url || product?.image_url || null;

    return {
      id: item.id,
      product_name: productName,
      size,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      image_url: imageUrl,
    };
  });
}

/**
 * Fetches full order details, address, customer details, items, and pricing by Order ID.
 */
export async function getOrderByOrderId(orderId: string): Promise<{
  success: boolean;
  order?: TrackedOrderDetails;
  error?: string;
}> {
  try {
    const cleanId = orderId.trim();
    if (!cleanId) {
      return { success: false, error: 'Please enter an Order ID.' };
    }

    // 1. Fetch order record
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .or(
        `order_id.ilike.${cleanId},id.eq.${
          cleanId.length === 36 ? cleanId : '00000000-0000-0000-0000-000000000000'
        }`
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderErr) {
      console.warn('Error fetching order by order_id:', orderErr.message);
      return { success: false, error: 'Could not fetch order. Please check the Order ID and try again.' };
    }

    if (!order) {
      return {
        success: false,
        error: `No order found with Order ID "${cleanId}". (Hint: Order ID is available at WhatsApp +91 9398965589)`,
      };
    }

    // 2. Fetch order items (query by UUID id and fallback to string order_id if needed)
    let rawItems: any[] = [];
    const { data: itemsByUuid, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    if (itemsErr) {
      console.warn('Error fetching order items by order.id:', itemsErr.message);
    }

    if (itemsByUuid && itemsByUuid.length > 0) {
      rawItems = itemsByUuid;
    } else {
      // Fallback query in case order_items used order_id string
      const { data: itemsByString } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.order_id)
        .order('created_at', { ascending: true });
      if (itemsByString && itemsByString.length > 0) {
        rawItems = itemsByString;
      }
    }

    // Enrich items with Product Name, Size from products and product_variants tables
    const items = await enrichOrderItems(rawItems);

    const fullName = [order.first_name, order.last_name].filter(Boolean).join(' ') || 'Customer';

    const trackedOrder: TrackedOrderDetails = {
      id: order.id,
      order_id: order.order_id,
      created_at: order.created_at,
      status: order.status || 'pending',
      payment_status: order.payment_status || 'pending',
      payment_method: order.payment_method || 'WhatsApp / COD / UPI',
      customer: {
        first_name: order.first_name || '',
        last_name: order.last_name || null,
        full_name: fullName,
        mobile: order.mobile || '',
        email: order.email || null,
      },
      address: {
        address_line1: order.address_line1 || '',
        city: order.city || '',
        state: order.state || 'Andhra Pradesh',
        postal_code: order.postal_code || '',
      },
      pricing: {
        sub_total: Number(order.sub_total) || Number(order.amount) || 0,
        discount: Number(order.discount) || 0,
        coupon_code: order.coupon_code || null,
        referral_code: order.referral_code || null,
        amount: Number(order.amount) || 0,
        items_quantity: Number(order.items_quantity) || items.length || 1,
      },
      items,
      notes: order.notes || null,
      tracking_number: order.tracking_number || null,
      carrier: order.carrier || null,
      estimated_delivery_date: order.estimated_delivery_date || null,
    };

    return { success: true, order: trackedOrder };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search order.';
    return { success: false, error: message };
  }
}

/**
 * Searches for a customer by Mobile Number and Access Key.
 */
export async function getCustomerByMobileAndKey(
  mobile: string,
  key: string
): Promise<{
  success: boolean;
  customer?: CustomerAccount;
  error?: string;
}> {
  try {
    const rawMobile = mobile.trim();
    const cleanKey = key.trim();

    if (!rawMobile) {
      return { success: false, error: 'Please enter your mobile number.' };
    }
    if (!cleanKey) {
      return { success: false, error: 'Please enter your customer access key.' };
    }

    const digitsOnly = rawMobile.replace(/\D/g, '');
    const tenDigit = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Search customers matching phone and key
    const { data: customerList, error: custErr } = await supabase
      .from('customers')
      .select('*')
      .or(`mobile_number.eq.${rawMobile},mobile_number.eq.${tenDigit},mobile_number.eq.+91${tenDigit}`)
      .ilike('key', cleanKey)
      .order('created_at', { ascending: false })
      .limit(1);

    if (custErr) {
      console.warn('Error querying customer account:', custErr.message);
      return { success: false, error: 'Could not verify customer details. Please try again.' };
    }

    if (!customerList || customerList.length === 0) {
      const { data: fallbackList } = await supabase
        .from('customers')
        .select('*')
        .or(`mobile_number.eq.${rawMobile},mobile_number.eq.${tenDigit},mobile_number.eq.+91${tenDigit}`)
        .order('created_at', { ascending: false })
        .limit(5);

      const matched = fallbackList?.find(
        (c) => c.key && c.key.toLowerCase().trim() === cleanKey.toLowerCase()
      );

      if (matched) {
        return {
          success: true,
          customer: {
            id: matched.id,
            name: matched.name,
            mobile_number: matched.mobile_number,
            email: matched.email || null,
            address: matched.address || null,
            city: matched.city || null,
            city_code: matched.city_code || null,
            loyalty_points: parseFloat(String(matched.loyalty_points ?? '0')) || 0,
            referral_code: matched.referral_code || null,
            key: matched.key,
            created_at: matched.created_at,
          },
        };
      }

      return {
        success: false,
        error: 'No customer account found with this Mobile Number and Key combination.',
      };
    }

    const row = customerList[0];
    return {
      success: true,
      customer: {
        id: row.id,
        name: row.name,
        mobile_number: row.mobile_number,
        email: row.email || null,
        address: row.address || null,
        city: row.city || null,
        city_code: row.city_code || null,
        loyalty_points: parseFloat(String(row.loyalty_points ?? '0')) || 0,
        referral_code: row.referral_code || null,
        key: row.key,
        created_at: row.created_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Customer lookup failed.';
    return { success: false, error: message };
  }
}

/**
 * Fetches all orders belonging to a customer.
 */
export async function getCustomerOrders(
  customerId: string,
  mobileNumber?: string
): Promise<CustomerOrderSummary[]> {
  try {
    let query = supabase
      .from('orders')
      .select('id, order_id, created_at, status, amount, items_quantity, sub_total, discount');

    if (customerId && mobileNumber) {
      query = query.or(`customer_id.eq.${customerId},mobile.eq.${mobileNumber.trim()}`);
    } else if (customerId) {
      query = query.eq('customer_id', customerId);
    } else if (mobileNumber) {
      query = query.eq('mobile', mobileNumber.trim());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching customer orders:', error.message);
      return [];
    }

    return (data || []).map((o) => ({
      id: o.id,
      order_id: o.order_id,
      created_at: o.created_at,
      status: o.status || 'pending',
      amount: Number(o.amount) || 0,
      items_quantity: Number(o.items_quantity) || 1,
      sub_total: Number(o.sub_total) || Number(o.amount) || 0,
      discount: Number(o.discount) || 0,
    }));
  } catch (err) {
    console.warn('Unexpected error in getCustomerOrders:', err);
    return [];
  }
}

/**
 * Given an order ID or order UUID, fetches and returns ONLY the order items name.
 * As requested: "If they tap any order use that order id and display the order items name only."
 */
export async function getOrderItemsByOrderId(orderId: string): Promise<{
  orderId: string;
  itemNames: string[];
  itemsList: OrderItemSimple[];
}> {
  try {
    const cleanId = orderId.trim();
    if (!cleanId) {
      return { orderId: '', itemNames: [], itemsList: [] };
    }

    // 1. Get the order id UUID if cleanId is user-friendly order_id (e.g. ORD-260920-101)
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_id')
      .or(
        `order_id.ilike.${cleanId},id.eq.${
          cleanId.length === 36 ? cleanId : '00000000-0000-0000-0000-000000000000'
        }`
      )
      .limit(1)
      .maybeSingle();

    const targetOrderId = order?.id || cleanId;
    const displayOrderId = order?.order_id || cleanId;

    // 2. Fetch items for this order
    let rawItems: any[] = [];
    const { data: itemsByUuid, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', targetOrderId)
      .order('created_at', { ascending: true });

    if (!error && itemsByUuid && itemsByUuid.length > 0) {
      rawItems = itemsByUuid;
    } else {
      const { data: itemsByString } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', displayOrderId)
        .order('created_at', { ascending: true });
      if (itemsByString && itemsByString.length > 0) {
        rawItems = itemsByString;
      }
    }

    if (rawItems.length === 0) {
      return { orderId: displayOrderId, itemNames: [], itemsList: [] };
    }

    const enrichedItems = await enrichOrderItems(rawItems);

    const itemsList: OrderItemSimple[] = enrichedItems.map((item) => ({
      name: item.product_name,
      size: item.size || undefined,
      quantity: item.quantity,
    }));

    const itemNames = enrichedItems.map((item) => {
      const sizeSuffix = item.size ? ` (${item.size})` : '';
      const qtySuffix = item.quantity > 1 ? ` x ${item.quantity}` : '';
      return `${item.product_name}${sizeSuffix}${qtySuffix}`;
    });

    return {
      orderId: displayOrderId,
      itemNames,
      itemsList,
    };
  } catch (err) {
    console.warn('Error in getOrderItemsByOrderId:', err);
    return { orderId, itemNames: [], itemsList: [] };
  }
}
