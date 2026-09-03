import { createClient } from './server';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole() {
  const supabase = await createClient();
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
