'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cartStore';
import { createOrder, CheckoutFormData } from '@/lib/ordersStore';
import { openWhatsAppOrder, WHATSAPP_PHONE_NUMBER } from '@/lib/whatsapp';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
  User,
  Mail,
  FileText,
  ShoppingBag,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export default function CheckoutComponent() {
  const {
    items,
    totalQuantity,
    subTotal,
    savings,
    couponCode,
    couponDiscount,
    referralCode,
    totalAmount,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Andhra Pradesh',
    postalCode: '',
    referralCode: referralCode || '',
    couponCode: couponCode || '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderCompleted, setOrderCompleted] = useState<{
    orderId: string;
    customerName: string;
    totalAmount: number;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrorMsg('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!formData.firstName.trim()) {
      setErrorMsg('Please enter your first name.');
      return;
    }

    if (!formData.mobile.trim() || formData.mobile.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.addressLine1.trim()) {
      setErrorMsg('Please enter your delivery street address.');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city/town.');
      return;
    }

    if (!formData.postalCode.trim()) {
      setErrorMsg('Please enter your postal/PIN code.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Insert into Supabase (orders, order_items, customers)
      const result = await createOrder(
        formData,
        items,
        subTotal,
        couponDiscount,
        totalAmount
      );

      if (!result.success || !result.orderId) {
        throw new Error(result.error || 'Failed to place order in database.');
      }

      const generatedOrderId = result.orderId;

      // 2. Draft and Open WhatsApp message to 9398965589
      openWhatsAppOrder({
        orderId: generatedOrderId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        items: items,
        subTotal: subTotal,
        discount: couponDiscount,
        totalAmount: totalAmount,
        referralCode: formData.referralCode,
        couponCode: formData.couponCode,
        notes: formData.notes,
      });

      // 3. Mark completed and clear cart
      setOrderCompleted({
        orderId: generatedOrderId,
        customerName: `${formData.firstName} ${formData.lastName || ''}`.trim(),
        totalAmount: totalAmount,
      });

      clearCart();
    } catch (err: unknown) {
      console.error('Error placing order:', err);
      const message = err instanceof Error ? err.message : 'An error occurred while placing your order. Please try again.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success Screen
  if (orderCompleted) {
    return (
      <div className="app-container py-16 md:py-24 max-w-2xl mx-auto text-center">
        <div className="bg-white border border-[#E8E0D2] rounded-3xl p-8 md:p-12 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Order Confirmed & Sent via WhatsApp
            </span>
            <h1 className="font-brand-display text-3xl font-bold text-[#231E1A]">
              Thank You, {orderCompleted.customerName}!
            </h1>
            <p className="text-sm text-[#6B5E54]">
              Your order has been recorded with Order ID: <strong className="text-[#963A1F]">#{orderCompleted.orderId}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8E0D2] text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B5E54]">Total Payable:</span>
              <span className="font-bold text-[#963A1F]">Rs. {orderCompleted.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5E54]">WhatsApp Support:</span>
              <span className="font-medium text-[#231E1A]">+91 93989 65589</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5E54]">Status:</span>
              <span className="font-medium text-amber-700">Pending Confirmation</span>
            </div>
          </div>

          <p className="text-xs text-[#96887D]">
            If WhatsApp didn&apos;t open automatically on your device, you can click below to message us directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
                `Hi Kunddan Home Foods, I have placed order #${orderCompleted.orderId}. Please confirm my order details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Open WhatsApp Chat</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href="/products"
              className="btn-outline flex-1 py-3.5 flex items-center justify-center gap-2"
            >
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart Guard
  if (items.length === 0) {
    return (
      <div className="app-container py-20 text-center">
        <div className="empty-state-box">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3ECE1] flex items-center justify-center text-[#963A1F]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="empty-state-title">
            Your Cart is Empty
          </h2>
          <p className="empty-state-desc mb-6">
            Please add your favorite home food items to cart before proceeding to checkout.
          </p>
          <Link href="/products" className="btn-primary">
            Explore Fresh Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Navigation Header */}
      <section className="app-container pt-6 pb-4">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B5E54] hover:text-[#963A1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </section>

      {/* Checkout Form & Summary Grid */}
      <section className="app-container pb-20">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E8E0D2] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#F0E9DD] flex items-center justify-between">
                <div>
                  <h1 className="font-brand-display text-2xl font-bold text-[#231E1A]">
                    Delivery Details
                  </h1>
                  <p className="text-xs text-[#6B5E54] mt-0.5">
                    We will dispatch fresh homemade packs directly to this address.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Order</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#963A1F]" />
                    <span>First Name *</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#963A1F]" />
                    <span>Mobile Number (WhatsApp) *</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    maxLength={15}
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#963A1F]" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yourname@gmail.com"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-4 pt-2 border-t border-[#F0E9DD]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#963A1F]" />
                    <span>House / Flat / Street Address *</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Flat No, Apartment / Building name, Street"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                    Landmark / Area (Optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Near temple, Opp. park, etc."
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Hyderabad"
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="select-field"
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Other States">Other States</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      maxLength={10}
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 500001"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div className="space-y-1.5 pt-2 border-t border-[#F0E9DD]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#963A1F]" />
                  <span>Order Notes / Special Requests (Optional)</span>
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any spice level preference, delivery instructions, etc."
                  className="textarea-field text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Final Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E8E0D2] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              <h2 className="font-brand-display text-xl font-bold text-[#231E1A] pb-3 border-b border-[#F0E9DD]">
                Final Order Summary
              </h2>

              {/* Itemized Mini List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.cart_item_id} className="flex items-center justify-between text-sm py-1.5 border-b border-[#F5EFE6]">
                    <div className="space-y-0.5 max-w-[200px]">
                      <p className="font-bold text-[#231E1A] truncate">{item.product_name}</p>
                      <p className="text-xs text-[#6B5E54]">
                        {item.size} &times; {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-bold text-[#963A1F]">
                      Rs. {item.line_total}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-sm pt-2">
                <div className="flex justify-between text-[#6B5E54]">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-[#231E1A]">Rs. {subTotal}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium text-xs">
                    <span>Total MRP Savings</span>
                    <span>- Rs. {savings}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#963A1F] font-semibold text-xs">
                    <span>Coupon ({couponCode})</span>
                    <span>- Rs. {couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6B5E54] text-xs">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-medium">Free / WhatsApp Confirmation</span>
                </div>

                <div className="pt-3 border-t border-[#F0E9DD] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#231E1A]">
                    Total Amount
                  </span>
                  <span className="text-2xl md:text-3xl font-bold font-brand-display text-[#963A1F]">
                    Rs. {totalAmount}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    <span>Place Order via WhatsApp</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-[#96887D] leading-relaxed">
                  Tapping <strong>Place Order</strong> will record your order in our system and open a drafted message directly to WhatsApp (+91 9398965589) for instant kitchen confirmation.
                </p>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
