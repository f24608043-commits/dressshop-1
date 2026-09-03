import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminOrdersClient } from './admin-orders-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*), coupon:coupons(code), user:profiles(name, email, phone, address, city, province, postal_code)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">View all customer orders with form details and product variations.</p>
      </div>
      <AdminOrdersClient orders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
