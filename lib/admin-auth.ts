import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = await getUserRole();

  if (!user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  if (role !== 'ADMIN') {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    user,
  };
}
