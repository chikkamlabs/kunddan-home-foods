'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedProducts, Product } from '@/lib/productsStore';
import ProductVariantModal from '@/components/productvariant';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleOpenVariantModal = (product: Product) => {
    setModalProduct(product);
    setIsModalOpen(true);
  };

  if (!loading && products.length === 0) {
    return null; // Do not show section if no featured products
  }

  return (
    <section id="featured-products" className="app-container py-12 md:py-20 border-t border-[#E8E0D2]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
        <div className="space-y-3 max-w-2xl">
          <div className="text-eyebrow flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#963A1F]" />
            <span>POPULAR DELIGHTS</span>
          </div>
          <h2 className="text-section-title">
            Our Most Selling Items
          </h2>
          <p className="text-body-regular">
            Handpicked favorites most loved by our customers across India.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#963A1F] hover:text-[#7E2E16] transition-colors pb-1 self-start md:self-end"
        >
          <span>View all products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-[#E8E0D2] rounded-3xl overflow-hidden p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-square bg-[#F3ECE1] rounded-2xl w-full" />
              <div className="flex gap-2">
                <div className="h-6 bg-[#F3ECE1] rounded-full w-20" />
                <div className="h-6 bg-[#F3ECE1] rounded-full w-28" />
              </div>
              <div className="h-6 bg-[#F3ECE1] rounded w-3/4" />
              <div className="h-4 bg-[#F3ECE1] rounded w-full" />
              <div className="h-10 bg-[#F3ECE1] rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Featured Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => {
            const displayImage = product.parsed_images?.[0] || product.image_url;
            const categoryName = product.category?.name || 'Home Foods';
            const price = product.lowest_price ?? (product.variants?.[0]?.selling_price);
            const size = product.base_size ?? product.variants?.[0]?.size;

            return (
              <div key={product.id || product.product_id} className="product-card">
                {/* Product Image */}
                <div className="product-card-image-wrap">
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F3ECE1] text-[#96887D]">
                      <span className="text-sm font-medium">No Image</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="product-card-body">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="product-badge-primary">
                      {categoryName}
                    </span>
                    {product.used_in_txt && (
                      <span className="product-badge-secondary truncate max-w-[180px]">
                        {product.used_in_txt}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="product-card-title">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="product-card-description">
                      {product.description}
                    </p>
                  )}

                  {/* Pricing and View Details Link */}
                  <div className="flex items-end justify-between pt-2 border-t border-[#F0E9DD]">
                    <div>
                      {price !== undefined ? (
                        <>
                          <div className="product-price-value">
                            Rs. {price}
                          </div>
                          {size && (
                            <div className="product-price-caption">
                              Price shown for {size}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-[#96887D] italic">
                          Price on request
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/openproduct?id=${product.id || product.product_id}`}
                      className="product-view-link"
                    >
                      <span>View details</span>
                      <span aria-hidden="true">-&gt;</span>
                    </Link>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenVariantModal(product)}
                    className="btn-add-cart"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Variant Selection Modal */}
      <ProductVariantModal
        product={modalProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
