'use client';

import { useState, useEffect } from 'react';
import { Product, ProductVariant, getProductVariants } from '@/lib/productsStore';
import { addToCart } from '@/lib/cartStore';
import { X, Minus, Plus, Check, ShoppingBag } from 'lucide-react';

interface ProductVariantModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart?: () => void;
}

function ProductVariantModalContent({
  product,
  onClose,
  onAddedToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddedToCart?: () => void;
}) {
  const [variants, setVariants] = useState<ProductVariant[]>(product.variants || []);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(
    !product.variants || product.variants.length === 0
  );

  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      let isMounted = true;
      getProductVariants(product.id)
        .then((vars) => {
          if (isMounted) {
            setVariants(vars);
            if (vars.length > 0) {
              setSelectedVariant(vars[0]);
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoadingVariants(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [product.id, product.variants]);

  const currentPrice = selectedVariant ? selectedVariant.selling_price : (product.lowest_price ?? 0);
  const currentMrp = selectedVariant ? selectedVariant.mrp : currentPrice;
  const lineTotal = Number((currentPrice * quantity).toFixed(2));
  const currentSize = selectedVariant ? selectedVariant.size : 'Standard';

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!selectedVariant && variants.length > 0) return;

    addToCart({
      product_id: product.id,
      product_name: product.name,
      variant_id: selectedVariant ? selectedVariant.id : product.id,
      size: currentSize,
      mrp: currentMrp,
      selling_price: currentPrice,
      quantity: quantity,
      image_url: product.parsed_images?.[0] || product.image_url,
      used_in_txt: product.used_in_txt,
    });

    setAdded(true);
    if (onAddedToCart) onAddedToCart();

    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-[#E8E0D2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Product Name + Close */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DD]">
          <h3 className="text-xl md:text-2xl font-bold font-brand-display text-[#231E1A] line-clamp-1 pr-2">
            {product.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B5E54] hover:text-[#231E1A] hover:bg-[#F3ECE1] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5">
          {/* Weight / Variant Selection */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] block">
              WEIGHT
            </span>
            {loadingVariants ? (
              <div className="flex gap-2">
                <div className="h-10 bg-[#F3ECE1] rounded-full w-20 animate-pulse" />
                <div className="h-10 bg-[#F3ECE1] rounded-full w-20 animate-pulse" />
              </div>
            ) : variants.length > 0 ? (
              <div className="bg-[#EFE7DC] p-1 rounded-2xl flex flex-wrap gap-1">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex-1 min-w-[70px] py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-center ${
                        isSelected
                          ? 'bg-white text-[#231E1A] shadow-xs'
                          : 'text-[#6B5E54] hover:text-[#231E1A]'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm font-medium text-[#231E1A] bg-[#F3ECE1] px-4 py-2 rounded-xl inline-block">
                {product.base_size || 'Standard pack'}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] block">
              QUANTITY
            </span>
            <div className="flex items-center justify-end">
              <div className="flex items-center border border-[#E8E0D2] rounded-full bg-white px-2 py-1 gap-4">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#963A1F] hover:bg-[#F3ECE1] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-bold text-[#231E1A] min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#963A1F] hover:bg-[#F3ECE1] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline justify-between pt-2 border-t border-[#F0E9DD]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E54] block">
                PRICE
              </span>
              {currentMrp > currentPrice && (
                <span className="text-xs text-[#96887D] line-through block mt-0.5">
                  MRP: Rs. {currentMrp * quantity}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl md:text-3xl font-bold font-brand-display text-[#963A1F]">
                Rs. {lineTotal}
              </span>
              {quantity > 1 && (
                <span className="text-[11px] text-[#96887D] block">
                  (Rs. {currentPrice} x {quantity})
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={added}
            onClick={handleAddToCart}
            className={`btn-add-cart py-3.5 text-base font-bold transition-all ${
              added ? 'bg-emerald-700 border-emerald-700 text-white' : ''
            }`}
          >
            {added ? (
              <span className="inline-flex items-center gap-2">
                <Check className="w-5 h-5" /> Added to Cart!
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Add to cart
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductVariantModal({
  product,
  isOpen,
  onClose,
  onAddedToCart,
}: ProductVariantModalProps) {
  if (!isOpen || !product) return null;

  return (
    <ProductVariantModalContent
      key={`${product.id}_${isOpen ? 'open' : 'closed'}`}
      product={product}
      onClose={onClose}
      onAddedToCart={onAddedToCart}
    />
  );
}
