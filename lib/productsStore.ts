import { supabase } from './supabase';
import { Category } from './categoriesStore';

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  mrp: number;
  selling_price: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  product_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  notes?: string | null;
  list?: string | null;
  estimated_delivery?: string | null;
  image_url?: string | null;
  used_in_txt?: string | null;
  benefits?: string | null;
  featured: boolean;
  status: boolean;
  available: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined or derived fields
  category?: Category | null;
  variants?: ProductVariant[];
  lowest_price?: number;
  base_size?: string;
  parsed_images?: string[];
}

/**
 * Helper to parse image URL(s) into an array of strings.
 */
export function parseProductImages(imageUrl?: string | null): string[] {
  if (!imageUrl) return [];
  try {
    if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // If not JSON array, continue
  }
  if (imageUrl.includes(',')) {
    return imageUrl.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [imageUrl];
}

/**
 * Fetches products from Supabase where status = true.
 * Optionally filters by categoryId (supports either category UUID or category_id code).
 * Includes variants where status = true.
 */
export async function getProducts(categoryFilter?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .eq('status', true)
      .order('name', { ascending: true });

    if (categoryFilter && categoryFilter !== 'all') {
      // Check if categoryFilter is a UUID or category_id text
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryFilter);
      if (isUUID) {
        query = query.eq('category_id', categoryFilter);
      } else {
        // Resolve category id first
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('category_id', categoryFilter)
          .maybeSingle();

        if (catData?.id) {
          query = query.eq('category_id', catData.id);
        } else {
          // If no matching category found by slug, fallback match
          query = query.eq('category_id', categoryFilter);
        }
      }
    }

    const { data: productsData, error: prodError } = await query;

    if (prodError) {
      console.error('Error fetching products from Supabase:', prodError.message);
      return [];
    }

    if (!productsData || productsData.length === 0) {
      return [];
    }

    // Fetch all variants for these products
    const productIds = productsData.map((p) => p.id);
    const { data: variantsData, error: varError } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)
      .eq('status', true)
      .order('selling_price', { ascending: true });

    if (varError) {
      console.warn('Could not fetch variants:', varError.message);
    }

    const variantsMap = new Map<string, ProductVariant[]>();
    if (variantsData) {
      for (const v of variantsData) {
        const list = variantsMap.get(v.product_id) || [];
        list.push(v);
        variantsMap.set(v.product_id, list);
      }
    }

    return productsData.map((p) => {
      const vars = variantsMap.get(p.id) || [];
      const lowestVar = vars.length > 0 ? vars[0] : null;
      return {
        ...p,
        category: p.categories || null,
        variants: vars,
        lowest_price: lowestVar ? lowestVar.selling_price : undefined,
        base_size: lowestVar ? lowestVar.size : undefined,
        parsed_images: parseProductImages(p.image_url),
      };
    });
  } catch (err) {
    console.error('Unexpected error in getProducts:', err);
    return [];
  }
}

/**
 * Fetches featured products from Supabase where featured = true and status = true.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data: productsData, error: prodError } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('featured', true)
      .eq('status', true)
      .order('name', { ascending: true });

    if (prodError) {
      console.error('Error fetching featured products from Supabase:', prodError.message);
      return [];
    }

    if (!productsData || productsData.length === 0) {
      return [];
    }

    const productIds = productsData.map((p) => p.id);
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)
      .eq('status', true)
      .order('selling_price', { ascending: true });

    const variantsMap = new Map<string, ProductVariant[]>();
    if (variantsData) {
      for (const v of variantsData) {
        const list = variantsMap.get(v.product_id) || [];
        list.push(v);
        variantsMap.set(v.product_id, list);
      }
    }

    return productsData.map((p) => {
      const vars = variantsMap.get(p.id) || [];
      const lowestVar = vars.length > 0 ? vars[0] : null;
      return {
        ...p,
        category: p.categories || null,
        variants: vars,
        lowest_price: lowestVar ? lowestVar.selling_price : undefined,
        base_size: lowestVar ? lowestVar.size : undefined,
        parsed_images: parseProductImages(p.image_url),
      };
    });
  } catch (err) {
    console.error('Unexpected error in getFeaturedProducts:', err);
    return [];
  }
}

/**
 * Fetches a single product by ID or product_id with variants and category.
 */
export async function getProductById(idOrProductId: string): Promise<Product | null> {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrProductId);
    
    let query = supabase.from('products').select('*, categories(*)');
    if (isUUID) {
      query = query.eq('id', idOrProductId);
    } else {
      query = query.eq('product_id', idOrProductId);
    }

    const { data: productData, error: prodError } = await query.maybeSingle();

    if (prodError) {
      console.error('Error fetching product by ID from Supabase:', prodError.message);
      return null;
    }

    if (!productData) {
      return null;
    }

    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productData.id)
      .eq('status', true)
      .order('selling_price', { ascending: true });

    const vars = (variantsData as ProductVariant[]) || [];
    const lowestVar = vars.length > 0 ? vars[0] : null;

    return {
      ...productData,
      category: productData.categories || null,
      variants: vars,
      lowest_price: lowestVar ? lowestVar.selling_price : undefined,
      base_size: lowestVar ? lowestVar.size : undefined,
      parsed_images: parseProductImages(productData.image_url),
    };
  } catch (err) {
    console.error('Unexpected error in getProductById:', err);
    return null;
  }
}

/**
 * Fetches product variants for a given product ID.
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('status', true)
      .order('selling_price', { ascending: true });

    if (error) {
      console.error('Error fetching product variants:', error.message);
      return [];
    }

    return (data as ProductVariant[]) || [];
  } catch (err) {
    console.error('Unexpected error in getProductVariants:', err);
    return [];
  }
}
