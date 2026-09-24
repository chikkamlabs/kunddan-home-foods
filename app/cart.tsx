'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/header';
import Footer from '@/app/footer';
import { useCart } from '@/lib/cartStore';
import { validateCoupon } from '@/lib/ordersStore';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  Share2,
  CheckCircle2,
  AlertCircle,
  PackageOpen,
} from 'lucide-react';

export default function CartComponent() {
  const {
    items,
    totalQuantity,
    subTotal,
    mrpTotal,
    savings,
    couponCode,
    couponDiscount,
    applyCoupon,
    referralCode,
    setReferralCode,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState(couponCode || '');
  const [inputReferral, setInputReferral] = useState(referralCode || '');
  const [couponStatus, setCouponStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: couponCode ? 'success' : 'idle',
    message: couponCode && couponDiscount > 0 ? `Coupon applied: Rs. ${couponDiscount} OFF!` : '',
  });
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    const cleanCoupon = (inputCoupon || couponCode).trim().toUpperCase();
    if (!cleanCoupon) {
      applyCoupon('', 0);
      setCouponStatus({ type: 'idle', message: '' });
      return;
    }

    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(cleanCoupon, subTotal);
      if (result.valid) {
        applyCoupon(cleanCoupon, result.discount);
        setCouponStatus({ type: 'success', message: result.message });
      } else {
        applyCoupon('', 0);
        setCouponStatus({ type: 'error', message: result.message });
      }
    } catch {
      applyCoupon('', 0);
      setCouponStatus({ type: 'error', message: 'Could not apply coupon' });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyReferral = () => {
    setReferralCode(inputReferral.trim().toUpperCase());
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="app-container pt-8 md:pt-12 pb-6 border-b border-[#E8E0D2]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-eyebrow mb-1">
              YOUR SELECTED HOMEMADE DELIGHTS
            </div>
            <h1 className="text-page-title">
              Shopping Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold uppercase tracking-wider text-[#96887D] hover:text-[#963A1F] transition-colors self-start md:self-auto"
            >
              Clear Cart
            </button>
          )}
        </div>
      </section>

      {/* Cart Content */}
      <section className="app-container py-10 md:py-14">
        {items.length === 0 ? (
          <div className="empty-state-box">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3ECE1] flex items-center justify-center text-[#963A1F]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="empty-state-title">
              Your cart is empty
            </h2>
            <p className="empty-state-desc mb-6">
              Looks like you haven&apos;t added any traditional home foods to your cart yet.
            </p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              <span>Explore Fresh Inventory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="bg-white border border-[#E8E0D2] rounded-3xl p-4 md:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Image & Product Details */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F3ECE1] border border-[#E8E0D2] flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#96887D]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <h3 className="font-brand-display text-lg font-bold text-[#231E1A] line-clamp-1">
                        {item.product_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3ECE1] text-[#963A1F]">
                          {item.size}
                        </span>
                        <span className="text-xs text-[#6B5E54]">
                          Rs. {item.selling_price} each
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper, Row Total & Remove Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0E9DD]">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#E8E0D2] rounded-full bg-[#FAF6F0] px-2 py-1 gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#963A1F] hover:bg-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-[#231E1A] min-w-[18px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#963A1F] hover:bg-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Row Total */}
                    <div className="text-right min-w-[75px]">
                      <div className="text-lg font-bold font-brand-display text-[#963A1F]">
                        Rs. {item.line_total}
                      </div>
                      {item.mrp > item.selling_price && (
                        <div className="text-[11px] text-[#96887D] line-through">
                          Rs. {item.mrp * item.quantity}
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.cart_item_id)}
                      className="p-2 text-[#96887D] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#963A1F] hover:text-[#7E2E16]"
                >
                  <span>&larr; Continue shopping fresh inventory</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary, Coupons & Checkout */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E8E0D2] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
                <h2 className="font-brand-display text-xl font-bold text-[#231E1A] pb-3 border-b border-[#F0E9DD]">
                  Order Summary
                </h2>

                {/* Pricing Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#6B5E54]">
                    <span>Items Total ({totalQuantity} items)</span>
                    <span className="font-medium text-[#231E1A]">Rs. {subTotal}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>MRP Savings</span>
                      <span>- Rs. {savings}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#963A1F] font-semibold">
                      <span>Coupon Discount ({couponCode})</span>
                      <span>- Rs. {couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#6B5E54]">
                    <span>Delivery</span>
                    <span className="font-medium text-emerald-700">Calculated at WhatsApp checkout</span>
                  </div>

                  <div className="pt-3 border-t border-[#F0E9DD] flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-bold text-[#231E1A] block">
                        Estimated Total
                      </span>
                      <span className="text-xs text-[#96887D]">
                        Inclusive of all local kitchen taxes
                      </span>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold font-brand-display text-[#963A1F]">
                      Rs. {totalAmount}
                    </span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="space-y-2 pt-2 border-t border-[#F0E9DD]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#963A1F]" />
                    <span>Have a Coupon Code?</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="input-field uppercase flex-1 text-sm py-2"
                    />
                    <button
                      type="button"
                      disabled={validatingCoupon}
                      onClick={handleApplyCoupon}
                      className="btn-outline text-xs px-4 py-2"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponStatus.message && (
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        couponStatus.type === 'success' ? 'text-emerald-700 font-semibold' : 'text-red-600'
                      }`}
                    >
                      {couponStatus.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{couponStatus.message}</span>
                    </p>
                  )}
                </div>

                {/* Referral Code Input */}
                <div className="space-y-2 pt-2 border-t border-[#F0E9DD]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#963A1F]" />
                    <span>Referral Code (Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FRIEND20"
                      value={inputReferral}
                      onChange={(e) => setInputReferral(e.target.value)}
                      onBlur={handleApplyReferral}
                      className="input-field text-sm py-2 uppercase flex-1"
                    />
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
