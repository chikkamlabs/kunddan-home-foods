'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories, Category } from '@/lib/categoriesStore';
import { PackageOpen, ArrowRight } from 'lucide-react';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <section id="categories" className="app-container py-12 md:py-20 border-t border-[#E8E0D2]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-3">
        <div className="text-eyebrow">
          EXPLORE OUR RANGE
        </div>
        <h2 className="text-section-title">
          Browse Our Categories
        </h2>
        <p className="text-body-regular">
          Discover authentically prepared homemade delicacies, crafted with traditional recipes and premium ingredients.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-[#E8E0D2] rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[16/10] bg-[#F3ECE1] rounded-xl w-full" />
              <div className="h-6 bg-[#F3ECE1] rounded w-3/4" />
              <div className="h-4 bg-[#F3ECE1] rounded w-full" />
              <div className="h-4 bg-[#F3ECE1] rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {/* Nothing Available Screen (When no Supabase records exist) */}
      {!loading && categories.length === 0 && (
        <div className="empty-state-box">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3ECE1] flex items-center justify-center text-[#963A1F]">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="empty-state-title">
            Nothing available
          </h3>
          <p className="empty-state-desc">
            No categories have been added to the database yet. Please check back soon or add records to the categories table.
          </p>
        </div>
      )}

      {/* Categories Grid (Direct Supabase data only) */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => {
            const categoryTarget = category.category_id || category.id;
            return (
              <div key={category.id || category.category_id} className="category-card">
                {/* Category Image */}
                <div className="category-card-image-wrap">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
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

                {/* Category Content */}
                <div className="category-card-content">
                  <h3 className="category-card-title">
                    {category.name}
                  </h3>
                  {category.description ? (
                    <p className="category-card-description mb-4">
                      {category.description}
                    </p>
                  ) : (
                    <p className="category-card-description text-[#96887D] italic mb-4">
                      No description available.
                    </p>
                  )}

                  {/* Open Category Action Link */}
                  <div className="pt-2 border-t border-[#F0E9DD] mt-auto">
                    <Link
                      href={`/products?category=${encodeURIComponent(categoryTarget)}`}
                      className="inline-flex items-center justify-between w-full py-2 text-sm font-semibold text-[#963A1F] hover:text-[#7E2E16] group transition-colors"
                    >
                      <span>Open category</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
