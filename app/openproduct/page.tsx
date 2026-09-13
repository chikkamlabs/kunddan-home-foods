'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/header';
import Footer from '@/app/footer';
import { getProductById, Product, ProductVariant } from '@/lib/productsStore';
import { addToCart } from '@/lib/cartStore';
import { ChevronDown, ArrowLeft, ArrowRight, PackageOpen, Check, ShoppingBag } from 'lucide-react';

function OpenProductContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Accordion states
  const [openDescription, setOpenDescription] = useState(true);
  const [openPantryNotes, setOpenPantryNotes] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    const price = selectedVariant ? selectedVariant.selling_price : (product.lowest_price ?? 0);
    const mrp = selectedVariant ? selectedVariant.mrp : price;
    const size = selectedVariant ? selectedVariant.size : (product.base_size || 'Standard');

    addToCart({
      product_id: product.id,
      product_name: product.name,
      variant_id: selectedVariant ? selectedVariant.id : product.id,
      size: size,
      mrp: mrp,
      selling_price: price,
      quantity: 1,
      image_url: selectedImage || product.image_url,
      used_in_txt: product.used_in_txt,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);

        if (data) {
          // Set initial active variant
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
          // Set initial active image
          const images = data.parsed_images || [];
          if (images.length > 0) {
            setSelectedImage(images[0]);
          } else if (data.image_url) {
            setSelectedImage(data.image_url);
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="app-container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 animate-pulse">
          <div className="lg:col-span-6 aspect-square bg-[#F3ECE1] rounded-3xl" />
          <div className="lg:col-span-6 space-y-6">
            <div className="h-6 bg-[#F3ECE1] rounded w-1/4" />
            <div className="h-12 bg-[#F3ECE1] rounded w-3/4" />
            <div className="h-40 bg-[#F3ECE1] rounded-3xl" />
            <div className="h-20 bg-[#F3ECE1] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-container py-20 text-center">
        <div className="empty-state-box">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3ECE1] flex items-center justify-center text-[#963A1F]">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h2 className="empty-state-title">
            Product Not Found
          </h2>
          <p className="empty-state-desc mb-6">
            The product you are looking for may have been moved or is currently unavailable.
          </p>
          <Link href="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.parsed_images && product.parsed_images.length > 0
    ? product.parsed_images
    : product.image_url
    ? [product.image_url]
    : [];

  const activeImage = selectedImage || images[0];
  const categoryName = product.category?.name || 'Authentic Home Foods';

  return (
    <div className="w-full">
      {/* Back to Products Navigation */}
      <div className="app-container pt-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B5E54] hover:text-[#963A1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to fresh inventory</span>
        </Link>
      </div>

      {/* Main Product Showcase Section */}
      <section className="app-container pt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Big Product Image & Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#EFE8DE] border border-[#E8E0D2] shadow-sm">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#96887D]">
                  <span className="text-base font-medium">No Image Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery (if more than 1 image) */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img
                        ? 'border-[#963A1F] scale-105 shadow-xs'
                        : 'border-[#E8E0D2] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} preview ${idx + 1}`}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Variants, Pricing & Collapsibles */}
          <div className="lg:col-span-6 space-y-6">
            {/* Category Eyebrow & Title */}
            <div>
              <p className="text-eyebrow mb-2">
                {categoryName}
              </p>
              <h1 className="text-page-title">
                {product.name}
              </h1>
            </div>

            {/* Purchase & Variant Selection Card */}
            <div className="bg-white border border-[#E8E0D2] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                    Weight / Size
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={isSelected ? 'variant-pill-active' : 'variant-pill-inactive'}
                        >
                          {v.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Row */}
              <div className="flex items-baseline justify-between pt-2 border-t border-[#F0E9DD]">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#96887D] block mb-1">
                    Selected price
                  </span>
                  <div className="text-3xl font-bold text-[#963A1F] font-brand-display">
                    Rs. {selectedVariant ? selectedVariant.selling_price : (product.lowest_price ?? '—')}
                  </div>
                  {selectedVariant && selectedVariant.mrp > selectedVariant.selling_price && (
                    <div className="text-xs text-[#96887D] line-through mt-0.5">
                      MRP: Rs. {selectedVariant.mrp}
                    </div>
                  )}
                </div>

                <div className="text-xs font-medium text-[#6B5E54] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Ready for dispatch</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={added}
                className={`btn-add-cart py-3.5 text-base flex items-center justify-center gap-2 transition-all ${
                  added ? 'bg-emerald-700 border-emerald-700 text-white' : ''
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to cart</span>
                  </>
                )}
              </button>

              {/* View Cart Link */}
              <div className="pt-1">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#963A1F] hover:text-[#7E2E16] transition-colors"
                >
                  <span>View shopping cart</span>
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </div>

            {/* Accordion Details */}
            <div className="space-y-3 pt-2">
              {/* Description Accordion */}
              <div className="product-accordion-item">
                <button
                  type="button"
                  onClick={() => setOpenDescription(!openDescription)}
                  className="product-accordion-trigger"
                >
                  <span>Description</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openDescription ? 'rotate-180 text-[#963A1F]' : 'text-[#6B5E54]'
                    }`}
                  />
                </button>
                {openDescription && (
                  <div className="product-accordion-content">
                    <p>
                      {product.description ||
                        'Made with traditional homestyle recipes, pure spices, and premium ingredients with zero artificial preservatives.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pantry Notes / Used In Accordion */}
              <div className="product-accordion-item">
                <button
                  type="button"
                  onClick={() => setOpenPantryNotes(!openPantryNotes)}
                  className="product-accordion-trigger"
                >
                  <span>Pantry notes</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openPantryNotes ? 'rotate-180 text-[#963A1F]' : 'text-[#6B5E54]'
                    }`}
                  />
                </button>
                {openPantryNotes && (
                  <div className="product-accordion-content space-y-2">
                    {product.used_in_txt && (
                      <p>
                        <strong className="text-[#231E1A]">Best enjoyed with:</strong> {product.used_in_txt}
                      </p>
                    )}
                    {product.notes && (
                      <p>
                        <strong className="text-[#231E1A]">Storage:</strong> {product.notes}
                      </p>
                    )}
                    {product.benefits && (
                      <p>
                        <strong className="text-[#231E1A]">Health benefits:</strong> {product.benefits}
                      </p>
                    )}
                    {!product.used_in_txt && !product.notes && !product.benefits && (
                      <p>Store in a cool, dry place. Always use a dry spoon.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Estimated Delivery Accordion */}
              <div className="product-accordion-item">
                <button
                  type="button"
                  onClick={() => setOpenDelivery(!openDelivery)}
                  className="product-accordion-trigger"
                >
                  <span>Estimated delivery</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openDelivery ? 'rotate-180 text-[#963A1F]' : 'text-[#6B5E54]'
                    }`}
                  />
                </button>
                {openDelivery && (
                  <div className="product-accordion-content">
                    <p>
                      {product.estimated_delivery ||
                        'Dispatched within 24-48 hours. Estimated delivery: 3-5 business days across India.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function OpenProductPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-[#96887D]">Loading product details...</div>}>
          <OpenProductContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
