import { supabase } from './supabase';

export interface Category {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  status?: boolean;
  available?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all categories directly from Supabase 'categories' table.
 * Returns an empty array if no data exists or if Supabase query fails.
 * Does NOT return mock or dummy data.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error.message);
      return [];
    }

    return (data as Category[]) || [];
  } catch (err) {
    console.error('Unexpected error fetching categories from Supabase:', err);
    return [];
  }
}

/**
 * Fetches a single category by category_id or id from Supabase.
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`category_id.eq.${categoryId},id.eq.${categoryId}`)
      .maybeSingle();

    if (error) {
      console.error('Error fetching category by ID:', error.message);
      return null;
    }

    return (data as Category) || null;
  } catch (err) {
    console.error('Unexpected error fetching category by ID:', err);
    return null;
  }
}
