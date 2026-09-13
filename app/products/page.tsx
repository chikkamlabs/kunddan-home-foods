'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/header';
import Footer from '@/app/footer';
import { getCategories, Category } from '@/lib/categoriesStore';
import { getProducts, Product } from '@/lib/productsStore';
import ProductVariantModal from '@/components/productvariant';
import { PackageOpen } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenVariantModal = (product: Product) => {
    setModalProduct(product);
    setIsModalOpen(true);
  };

  const handleSelectCategory = (cat: string) => {
    if (cat === 'all') {
      router.push('/products');
    } else {
      router.push(`/products?category=${encodeURIComponent(cat)}`);
    }
  };

  // Load categories for filter tabs
  useEffect(() => {
    async function loadCats() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCats();
  }, []);

  // Load products whenever activeCategory changes
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getProducts(activeCategory === 'all' ? undefined : activeCategory);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeCategory]);

  return (
    <div className="w-full">
      {/* Page Hero Header */}
      <section className="app-container pt-8 md:pt-14 pb-8 md:pb-12 text-center max-w-3xl mx-auto space-y-4">
        <div className="text-eyebrow">
          OUR HANDCRAFTED PANTRY
        </div>
        <h1 className="text-page-title">
          From our Fresh Inventory.
        </h1>
        <p className="text-body-lead">
          Shop our home made products. Made in small batches using traditional recipes and cold-pressed oils.
        </p>
      </section>

      {/* Categories Filter Tabs */}
      <section className="app-container pb-8">
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar justify-start md:justify-center">
          {/* 'All' Category Chip */}
          <button
            type="button"
            onClick={() => handleSelectCategory('all')}
            className={`filter-chip ${activeCategory === 'all' ? 'filter-chip-active' : ''}`}
          >
            All Products
          </button>

          {/* Dynamic Category Chips from Database */}
          {categories.map((cat) => {
            const isSelected =
              activeCategory === cat.category_id ||
              activeCategory === cat.id ||
              activeCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id || cat.category_id}
                type="button"
                onClick={() => handleSelectCategory(cat.category_id || cat.id)}
                className={`filter-chip ${isSelected ? 'filter-chip-active' : ''}`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="app-container pb-20">
        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
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

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="empty-state-box">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3ECE1] flex items-center justify-center text-[#963A1F]">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="empty-state-title">
              Nothing available
            </h3>
            <p className="empty-state-desc">
              No products found in this category at the moment. Please select another category or check back soon!
            </p>
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className="btn-outline mt-6"
              >
                View all products
              </button>
            )}
          </div>
        )}

        {/* Product Cards Grid */}
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

                    {/* Pricing & View Details Link */}
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

        {/* Variant Selection Modal */}
        <ProductVariantModal
          product={modalProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-[#96887D]">Loading products...</div>}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
