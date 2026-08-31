import React from 'react';
import { prisma } from '@/lib/prisma';
import { AdminOrdersClient } from './admin-orders-client';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { 
      items: true, 
      coupon: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          province: true,
          postalCode: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

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
