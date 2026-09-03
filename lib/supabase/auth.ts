import { createClient } from './server';
import { cookies } from 'next/headers';

export async function getUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return profile?.role || 'CUSTOMER';
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin() {
  const role = await getUserRole();
  if (role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  return await getUser();
}
