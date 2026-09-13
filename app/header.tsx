'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, Category } from '@/lib/categoriesStore';
import { useCart } from '@/lib/cartStore';
import { ShoppingBag, ChevronDown, Menu, X, Check, ArrowRight } from 'lucide-react';

interface AddedItemNotification {
  product_name: string;
  size?: string;
  quantity: number;
  selling_price?: number;
}

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedItemToast, setAddedItemToast] = useState<AddedItemNotification | null>(null);
  const { totalQuantity } = useCart();

  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const handleItemAdded = (event: Event) => {
      const customEvent = event as CustomEvent<AddedItemNotification>;
      if (customEvent.detail) {
        setAddedItemToast(customEvent.detail);

        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }

        toastTimeoutRef.current = setTimeout(() => {
          setAddedItemToast(null);
        }, 3500);
      }
    };

    window.addEventListener('kunddan_item_added', handleItemAdded);
    return () => {
      window.removeEventListener('kunddan_item_added', handleItemAdded);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    };
  }, []);

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
      categoryTimeoutRef.current = null;
    }
    setIsCategoryOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
    categoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 250);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E8E0D2]">
      <div className="app-container">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 pr-2">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#963A1F] shadow-xs flex-shrink-0 bg-white">
              <Image
                src="/logo.png"
                alt="Kunddan Home Foods Logo"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-brand-display text-base sm:text-xl md:text-2xl font-bold tracking-tight text-[#963A1F] group-hover:text-[#7E2E16] transition-colors leading-tight truncate">
                Kunddan Home Foods
              </span>
              <span className="text-[8.5px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#96887D] font-medium leading-none mt-0.5 truncate">
                Authentic Homemade Delights
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pill Bar */}
          <nav className="hidden lg:flex items-center">
            <div className="header-nav-container shadow-xs relative">
              <Link href="/" className="header-nav-link">
                Home
              </Link>

              {/* Categories with Safe Hover Bridge */}
              <div
                className="relative"
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <button
                  type="button"
                  className="header-nav-link flex items-center gap-1"
                  aria-expanded={isCategoryOpen}
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isCategoryOpen ? 'rotate-180 text-[#963A1F]' : 'text-[#6B5E54]'
                    }`}
                  />
                </button>

                {/* Hover Bridge & Dropdown Menu */}
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="category-dropdown !static">
                      <div className="px-3 py-2 border-b border-[#E8E0D2] mb-1 flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E3E22]">
                          Explore Our Pantry
                        </p>
                        <Link
                          href="/products"
                          onClick={() => setIsCategoryOpen(false)}
                          className="text-[11px] font-semibold text-[#963A1F] hover:underline"
                        >
                          All Categories
                        </Link>
                      </div>
                      <div className="max-h-80 overflow-y-auto py-1">
                        {/* All Categories Option */}
                        <Link
                          href="/products"
                          onClick={() => setIsCategoryOpen(false)}
                          className="category-dropdown-item group border-b border-[#F0E9DD] pb-2 mb-1"
                        >
                          <div className="w-2 h-2 rounded-full bg-[#963A1F] mt-1.5 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                          <div className="flex-1">
                            <p className="category-item-name group-hover:text-[#963A1F] transition-colors">
                              All Categories
                            </p>
                            <p className="category-item-desc">
                              View our complete fresh homemade catalog
                            </p>
                          </div>
                        </Link>

                        {categories.length === 0 ? (
                          <div className="px-3 py-4 text-center text-xs text-[#96887D]">
                            No categories found
                          </div>
                        ) : (
                          categories.map((cat) => {
                            const catParam = cat.category_id || cat.id;
                            return (
                              <Link
                                key={cat.id || cat.category_id}
                                href={`/products?category=${encodeURIComponent(catParam)}`}
                                onClick={() => setIsCategoryOpen(false)}
                                className="category-dropdown-item group"
                              >
                                <div className="w-2 h-2 rounded-full bg-[#963A1F] mt-1.5 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                                <div className="flex-1">
                                  <p className="category-item-name group-hover:text-[#963A1F] transition-colors">
                                    {cat.name}
                                  </p>
                                  {cat.description && (
                                    <p className="category-item-desc line-clamp-1">
                                      {cat.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="#story" className="header-nav-link">
                Our Story
              </Link>

              <Link href="#contact" className="header-nav-link">
                Contact us
              </Link>

              <Link href="#track-order" className="header-nav-link">
                Track your order
              </Link>

              {/* Desktop Cart Button & Popover */}
              <div className="relative">
                <Link
                  href="/cart"
                  className="header-nav-link flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4 text-[#6B5E54]" />
                  <span>Cart</span>
                  <span className="header-cart-badge">{totalQuantity}</span>
                </Link>

                {/* Pop Added to Cart Notification (Desktop) */}
                {addedItemToast && (
                  <div className="absolute right-0 top-full mt-3 w-64 z-50 bg-[#231E1A] text-white rounded-xl shadow-xl p-3 border border-[#3E342D] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#2A6D3A] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Added to Cart!</span>
                          <span className="text-[10px] text-[#C4B7AA] font-normal">
                            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#D8CDC0] line-clamp-1 font-medium mt-0.5">
                          {addedItemToast.quantity}× {addedItemToast.product_name}
                        </p>
                        {addedItemToast.size && (
                          <p className="text-[10px] text-[#A89C8F]">
                            Size: {addedItemToast.size}
                          </p>
                        )}
                        <Link
                          href="/cart"
                          onClick={() => setAddedItemToast(null)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#E3876B] hover:text-[#FFA082] transition-colors"
                        >
                          <span>View cart & checkout</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddedItemToast(null)}
                        className="text-[#96887D] hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Right Bar: Cart & Menu */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden relative">
            <div className="relative">
              <Link
                href="/cart"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#EFE8DE] text-xs font-semibold text-[#382A22]"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Cart</span>
                <span className="header-cart-badge !ml-1">{totalQuantity}</span>
              </Link>

              {/* Pop Added to Cart Notification (Mobile) */}
              {addedItemToast && (
                <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-[#231E1A] text-white rounded-xl shadow-xl p-3 border border-[#3E342D] animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#2A6D3A] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Added to Cart!</span>
                        <span className="text-[10px] text-[#C4B7AA] font-normal">
                          {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#D8CDC0] line-clamp-1 font-medium mt-0.5">
                        {addedItemToast.quantity}× {addedItemToast.product_name}
                      </p>
                      {addedItemToast.size && (
                        <p className="text-[10px] text-[#A89C8F]">
                          Size: {addedItemToast.size}
                        </p>
                      )}
                      <Link
                        href="/cart"
                        onClick={() => setAddedItemToast(null)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#E3876B] hover:text-[#FFA082] transition-colors"
                      >
                        <span>View Cart</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddedItemToast(null)}
                      className="text-[#96887D] hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-md text-[#382A22] hover:bg-[#EFE8DE] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 px-2 border-t border-[#E8E0D2] bg-[#FAF6F0] space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#231E1A] hover:bg-[#EFE8DE]"
            >
              Home
            </Link>

            <div className="px-3 py-2 rounded-lg bg-[#F3ECE1]/60">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#9E3E22]">
                  Categories
                </p>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[#963A1F]"
                >
                  All
                </Link>
              </div>
              <div className="space-y-1 pl-2">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 text-sm text-[#382A22] font-semibold flex items-center gap-2 border-b border-[#E8E0D2]/60 mb-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#963A1F]" />
                  <span>All Categories</span>
                </Link>

                {categories.length === 0 ? (
                  <p className="text-xs text-[#96887D] py-1">No categories found</p>
                ) : (
                  categories.map((cat) => {
                    const catParam = cat.category_id || cat.id;
                    return (
                      <Link
                        key={cat.id || cat.category_id}
                        href={`/products?category=${encodeURIComponent(catParam)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1.5 text-sm text-[#382A22] font-medium flex items-center gap-2 hover:text-[#963A1F]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#963A1F]" />
                        <span>{cat.name}</span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-[#963A1F] bg-[#F3ECE1]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>My Cart</span>
              </div>
              <span className="header-cart-badge">{totalQuantity}</span>
            </Link>

            <Link
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#231E1A] hover:bg-[#EFE8DE]"
            >
              Our Story
            </Link>

            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#231E1A] hover:bg-[#EFE8DE]"
            >
              Contact us
            </Link>

            <Link
              href="#track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#231E1A] hover:bg-[#EFE8DE]"
            >
              Track your order
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

