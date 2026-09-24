'use client';

import { useState, useEffect } from 'react';
import Header from '../header';
import Footer from '../footer';
import {
  getOrderByOrderId,
  getCustomerByMobileAndKey,
  getCustomerOrders,
  getOrderItemsByOrderId,
  TrackedOrderDetails,
  CustomerAccount,
  CustomerOrderSummary,
} from '@/lib/trackyourorder';
import {
  Search,
  Package,
  Clock,
  User,
  MapPin,
  Sparkles,
  Phone,
  Key,
  ChevronRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function TrackYourOrderPage() {
  const [activeTab, setActiveTab] = useState<'order' | 'account'>('order');

  // Tab 1: Order ID search
  const [orderIdInput, setOrderIdInput] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderDetails, setOrderDetails] = useState<TrackedOrderDetails | null>(null);

  // Tab 2: Mobile + Key lookup
  const [mobileInput, setMobileInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrderSummary[]>([]);

  // Tapped Order Items Name modal / drawer
  const [selectedOrderItems, setSelectedOrderItems] = useState<{
    orderId: string;
    loading: boolean;
    itemNames: string[];
  } | null>(null);

  const handleSearchOrder = async (overrideId?: string) => {
    const idToSearch = (overrideId !== undefined ? overrideId : orderIdInput).trim();
    if (!idToSearch) {
      setOrderError('Please enter an Order ID.');
      setOrderDetails(null);
      return;
    }

    setOrderLoading(true);
    setOrderError('');
    setOrderDetails(null);

    const result = await getOrderByOrderId(idToSearch);

    if (result.success && result.order) {
      setOrderDetails(result.order);
    } else {
      setOrderError(
        result.error ||
          `No order found with Order ID "${idToSearch}". (Hint: Order ID is available at WhatsApp +91 9398965589)`
      );
    }
    setOrderLoading(false);
  };

  // Auto-search if URL query has order_id
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOrderId = params.get('order_id') || params.get('orderId');
    if (urlOrderId) {
      const searchAsync = async () => {
        setOrderIdInput(urlOrderId);
        setOrderLoading(true);
        const result = await getOrderByOrderId(urlOrderId);
        if (result.success && result.order) {
          setOrderDetails(result.order);
        } else {
          setOrderError(
            result.error ||
              `No order found with Order ID "${urlOrderId}". (Hint: Order ID is available at WhatsApp +91 9398965589)`
          );
        }
        setOrderLoading(false);
      };
      searchAsync();
    }
  }, []);

  const handleAccountLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileInput.trim();
    const cleanKey = keyInput.trim();

    if (!cleanMobile) {
      setAccountError('Please enter your mobile number.');
      return;
    }
    if (!cleanKey) {
      setAccountError('Please enter your customer access key.');
      return;
    }

    setAccountLoading(true);
    setAccountError('');
    setCustomerAccount(null);
    setCustomerOrders([]);

    const result = await getCustomerByMobileAndKey(cleanMobile, cleanKey);

    if (result.success && result.customer) {
      setCustomerAccount(result.customer);
      // Fetch customer's orders
      const orders = await getCustomerOrders(result.customer.id, result.customer.mobile_number);
      setCustomerOrders(orders);
    } else {
      setAccountError(
        result.error ||
          'Could not find customer account with this Mobile Number and Key combination. Please verify your details.'
      );
    }
    setAccountLoading(false);
  };

  const handleOrderTap = async (orderId: string) => {
    setSelectedOrderItems({
      orderId,
      loading: true,
      itemNames: [],
    });

    const res = await getOrderItemsByOrderId(orderId);

    setSelectedOrderItems({
      orderId: res.orderId || orderId,
      loading: false,
      itemNames: res.itemNames,
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s === 'shipping') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (s === 'packed') return 'bg-purple-100 text-purple-800 border-purple-300';
    if (s === 'approved') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (s === 'rejected' || s === 'cancelled') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-amber-50 text-amber-900 border-amber-200';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="app-container max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-10">
            <span className="text-eyebrow">ORDER TRACKING & CUSTOMER PORTAL</span>
            <h1 className="text-section-title text-[#231E1A] mt-2 mb-3">
              Track Your Order
            </h1>
            <p className="text-body-regular text-[#6B5E54] max-w-xl mx-auto">
              Check real-time order status, delivery address, items, and your loyalty account history.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-full bg-[#EFE8DE] border border-[#E8E0D2] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('order')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'order'
                    ? 'bg-[#963A1F] text-white shadow-xs'
                    : 'text-[#6B5E54] hover:text-[#231E1A]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Track by Order ID</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'account'
                    ? 'bg-[#963A1F] text-white shadow-xs'
                    : 'text-[#6B5E54] hover:text-[#231E1A]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Mobile & Key History</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Track by Order ID */}
          {activeTab === 'order' && (
            <div className="space-y-6">
              {/* Search Card */}
              <div className="card p-6 md:p-8 bg-white border border-[#E8E0D2] rounded-2xl shadow-xs">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchOrder();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-[#963A1F]" />
                      <span>Enter Your Order ID *</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={orderIdInput}
                        onChange={(e) => {
                          setOrderIdInput(e.target.value);
                          if (orderError) setOrderError('');
                        }}
                        placeholder="e.g. ORD-260920-101"
                        className="input-field flex-1 uppercase font-medium"
                      />
                      <button
                        type="submit"
                        disabled={orderLoading || !orderIdInput.trim()}
                        className="btn-primary px-7 py-3 text-sm flex items-center justify-center gap-2 shrink-0"
                      >
                        {orderLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Track Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Hint (Mandatory Requirement) */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D2] text-xs text-[#6B5E54]">
                    <HelpCircle className="w-4 h-4 text-[#963A1F] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-[#231E1A]">Hint:</strong> Order ID is available at WhatsApp (+91 9398965589) after kitchen confirmation.
                    </p>
                  </div>
                </form>

                {/* Error Banner */}
                {orderError && (
                  <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{orderError}</p>
                  </div>
                )}
              </div>

              {/* Order Result Display */}
              {orderDetails && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Top Order Status Banner */}
                  <div className="card p-6 bg-white border border-[#E8E0D2] rounded-2xl shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E9DD] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#96887D] font-medium uppercase tracking-wider">
                            Order ID
                          </span>
                          <span className="font-brand-display text-lg font-bold text-[#963A1F]">
                            {orderDetails.order_id}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5E54] mt-0.5">
                          Placed on {new Date(orderDetails.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${getStatusBadgeClass(
                            orderDetails.status
                          )}`}
                        >
                          Status: {orderDetails.status}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Delivery Address Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                      {/* Customer Details */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#963A1F] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>Basic Customer Details</span>
                        </h4>
                        <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E8E0D2] text-xs space-y-1.5">
                          <p className="text-sm font-bold text-[#231E1A]">
                            {orderDetails.customer.full_name}
                          </p>
                          <p className="text-[#6B5E54] flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#963A1F]" />
                            <span>{orderDetails.customer.mobile}</span>
                          </p>
                          {orderDetails.customer.email && (
                            <p className="text-[#6B5E54]">
                              Email: {orderDetails.customer.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#963A1F] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Delivery Address</span>
                        </h4>
                        <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E8E0D2] text-xs space-y-1.5">
                          <p className="font-semibold text-[#231E1A]">
                            {orderDetails.address.address_line1}
                          </p>
                          <p className="text-[#6B5E54]">
                            {orderDetails.address.city}, {orderDetails.address.state} - {orderDetails.address.postal_code}
                          </p>
                          {orderDetails.tracking_number && (
                            <p className="text-xs font-semibold text-emerald-800 pt-1">
                              Tracking No: {orderDetails.tracking_number} ({orderDetails.carrier || 'Courier'})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Amount Summary */}
                  <div className="card p-6 bg-white border border-[#E8E0D2] rounded-2xl shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#963A1F] mb-4 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Order Items ({orderDetails.items.length})</span>
                    </h4>

                    <div className="divide-y divide-[#F0E9DD] border-y border-[#F0E9DD]">
                      {orderDetails.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3.5 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-semibold text-sm text-[#231E1A]">
                              {item.product_name}
                            </p>
                            <p className="text-[#96887D]">
                              {item.size ? `Pack size: ${item.size} • ` : ''}Qty: {item.quantity} × Rs. {item.unit_price}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#231E1A]">
                              Rs. {item.line_total}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Amount Breakdown */}
                    <div className="pt-5 space-y-2 text-xs">
                      <div className="flex justify-between text-[#6B5E54]">
                        <span>Subtotal</span>
                        <span>Rs. {orderDetails.pricing.sub_total}</span>
                      </div>

                      {orderDetails.pricing.discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>
                            Discount {orderDetails.pricing.coupon_code ? `(${orderDetails.pricing.coupon_code})` : ''}
                          </span>
                          <span>- Rs. {orderDetails.pricing.discount}</span>
                        </div>
                      )}

                      {orderDetails.pricing.referral_code && (
                        <div className="flex justify-between text-[#6B5E54]">
                          <span>Referral Code</span>
                          <span>{orderDetails.pricing.referral_code}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#231E1A] font-bold text-sm pt-2 border-t border-[#F0E9DD]">
                        <span>Total Amount</span>
                        <span className="text-[#963A1F]">
                          Rs. {orderDetails.pricing.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Customer Mobile & Key History */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Form to enter Mobile Number and Key */}
              <div className="card p-6 md:p-8 bg-white border border-[#E8E0D2] rounded-2xl shadow-xs">
                <form onSubmit={handleAccountLookup} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#963A1F]" />
                        <span>Mobile Number *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobileInput}
                        onChange={(e) => {
                          setMobileInput(e.target.value);
                          if (accountError) setAccountError('');
                        }}
                        placeholder="e.g. 9876543210"
                        className="input-field"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#963A1F]" />
                        <span>Customer Key *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={keyInput}
                        onChange={(e) => {
                          setKeyInput(e.target.value);
                          if (accountError) setAccountError('');
                        }}
                        placeholder="e.g. KND-1234-5678"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={accountLoading || !mobileInput.trim() || !keyInput.trim()}
                    className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                  >
                    {accountLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>View Customer Details & Orders</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Error Banner */}
                {accountError && (
                  <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{accountError}</p>
                  </div>
                )}
              </div>

              {/* Succeeded: Customer Details and Orders */}
              {customerAccount && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Customer Profile Card */}
                  <div className="card p-6 bg-white border border-[#E8E0D2] rounded-2xl shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E9DD] pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#963A1F]">
                          Verified Customer Profile
                        </span>
                        <h3 className="font-brand-display text-xl font-bold text-[#231E1A] mt-0.5">
                          {customerAccount.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Loyalty Points: {customerAccount.loyalty_points}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs">
                      <div>
                        <p className="text-[#96887D] font-medium">Mobile Number</p>
                        <p className="text-[#231E1A] font-semibold mt-0.5">
                          {customerAccount.mobile_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#96887D] font-medium">Email</p>
                        <p className="text-[#231E1A] font-semibold mt-0.5">
                          {customerAccount.email || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#96887D] font-medium">Saved City & Pincode</p>
                        <p className="text-[#231E1A] font-semibold mt-0.5">
                          {customerAccount.city ? `${customerAccount.city} (${customerAccount.city_code || ''})` : 'Not provided'}
                        </p>
                      </div>
                      {customerAccount.address && (
                        <div className="sm:col-span-2 md:col-span-3">
                          <p className="text-[#96887D] font-medium">Saved Address</p>
                          <p className="text-[#231E1A] font-medium mt-0.5">
                            {customerAccount.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="card p-6 bg-white border border-[#E8E0D2] rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#963A1F] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>Your Orders ({customerOrders.length})</span>
                      </h4>
                      <span className="text-[11px] text-[#96887D]">
                        Tap any order to view item names
                      </span>
                    </div>

                    {customerOrders.length === 0 ? (
                      <div className="p-8 text-center bg-[#FAF6F0] rounded-xl border border-[#E8E0D2]">
                        <Package className="w-8 h-8 text-[#96887D] mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium text-[#6B5E54]">
                          No orders found under this account yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customerOrders.map((ord) => (
                          <div
                            key={ord.id}
                            onClick={() => handleOrderTap(ord.order_id)}
                            className="p-4 rounded-xl border border-[#E8E0D2] bg-[#FAF6F0]/60 hover:bg-[#FAF6F0] hover:border-[#963A1F]/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-brand-display text-sm font-bold text-[#963A1F] group-hover:underline">
                                  {ord.order_id}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                                    ord.status
                                  )}`}
                                >
                                  {ord.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#6B5E54] flex items-center gap-2">
                                <Clock className="w-3 h-3 text-[#96887D]" />
                                <span>
                                  {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span>•</span>
                                <span>{ord.items_quantity} items</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <span className="text-sm font-bold text-[#231E1A]">
                                Rs. {ord.amount}
                              </span>
                              <div className="p-1.5 rounded-full bg-white border border-[#E8E0D2] group-hover:bg-[#963A1F] group-hover:text-white transition-colors">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal / Dialog: Display Order Items Name Only when tapping any order */}
          {selectedOrderItems && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white border border-[#E8E0D2] rounded-2xl p-6 max-w-md w-full shadow-dropdown space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0E9DD] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#96887D]">
                      Order Items
                    </span>
                    <h3 className="font-brand-display text-base font-bold text-[#963A1F]">
                      {selectedOrderItems.orderId}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderItems(null)}
                    className="p-1.5 rounded-full hover:bg-[#FAF6F0] text-[#6B5E54]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedOrderItems.loading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-xs text-[#6B5E54] gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#963A1F]" />
                    <span>Loading order items...</span>
                  </div>
                ) : selectedOrderItems.itemNames.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#6B5E54]">
                    No item names recorded for this order.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E54] mb-1">
                      Purchased Items:
                    </p>
                    <ul className="space-y-1.5">
                      {selectedOrderItems.itemNames.map((name, index) => (
                        <li
                          key={index}
                          className="text-xs text-[#231E1A] font-medium p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D2] flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#EFE8DE] text-[#963A1F] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="flex-1">{name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-[#F0E9DD] flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Switch to Track Order tab with this ID
                      const id = selectedOrderItems.orderId;
                      setSelectedOrderItems(null);
                      setActiveTab('order');
                      setOrderIdInput(id);
                      handleSearchOrder(id);
                    }}
                    className="btn-outline flex-1 py-2 text-xs flex items-center justify-center gap-1"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderItems(null)}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
