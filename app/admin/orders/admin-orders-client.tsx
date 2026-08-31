'use client';

import React, { useState } from 'react';

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function AdminOrdersClient({ orders: initialOrders }: { orders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
        <thead className="bg-neutral-900 text-white font-bold">
          <tr>
            <th className="p-3">Order ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">City</th>
            <th className="p-3">Items</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => (
            <>
              <tr key={o.id} className="hover:bg-gray-50 text-xs">
                <td className="p-3 font-mono font-bold text-gray-700 text-[10px] max-w-24 truncate">{o.id.slice(0, 8)}...</td>
                <td className="p-3">
                  <div className="font-bold text-gray-900">{o.customerName}</div>
                  <div className="text-gray-400">{o.customerEmail}</div>
                </td>
                <td className="p-3 text-gray-600">{o.city}</td>
                <td className="p-3 font-bold text-gray-900">{o.items?.length || 0} items</td>
                <td className="p-3 font-black text-gray-900">Rs. {Number(o.total).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    o.status === 'DELIVERED'  ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'SHIPPED'    ? 'bg-blue-100 text-blue-800' :
                    o.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                    o.status === 'CANCELLED'  ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpand(o.id)}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white font-bold text-[10px] rounded"
                    >
                      {expandedOrderId === o.id ? 'Hide' : 'View'}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedOrderId === o.id && (
                <tr key={`${o.id}-details`}>
                  <td colSpan={8} className="p-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Customer Details */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="font-bold text-gray-900 mb-2">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <span className="ml-2 font-medium">{o.customerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-2 font-medium">{o.customerEmail}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="ml-2 font-medium">{o.phone || o.user?.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Address:</span>
                            <span className="ml-2 font-medium">{o.address || o.user?.address || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">City:</span>
                            <span className="ml-2 font-medium">{o.city || o.user?.city || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Province:</span>
                            <span className="ml-2 font-medium">{o.province || o.user?.province || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Postal Code:</span>
                            <span className="ml-2 font-medium">{o.postalCode || o.user?.postalCode || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {o.items?.map((item: any) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-bold text-gray-900">{item.productName}</div>
                                  <div className="text-gray-400 text-[10px]">SKU: {item.variationSku || 'N/A'}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900">Rs. {Number(item.totalPrice).toLocaleString()}</div>
                                  <div className="text-gray-400 text-[10px]">Qty: {item.quantity} × Rs. {Number(item.unitPrice).toLocaleString()}</div>
                                </div>
                              </div>
                              {item.selectedOptions && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="text-[10px] text-gray-500 mb-1">Selected Variations:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                                      <span key={key} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] font-medium">
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="font-medium">Rs. {Number(o.subtotal).toLocaleString()}</span>
                        </div>
                        {o.discount && o.discount > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Discount:</span>
                            <span className="font-medium text-red-600">-Rs. {Number(o.discount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold mt-1 pt-1 border-t border-gray-200">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">Rs. {Number(o.total).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-bold text-gray-900 mb-2">Update Status</h3>
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={o.status}
                            id={`status-${o.id}`}
                            className="px-3 py-2 text-xs border border-gray-300 rounded bg-white font-bold"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            disabled={updatingId === o.id}
                            onClick={() => {
                              const sel = document.getElementById(`status-${o.id}`) as HTMLSelectElement;
                              handleStatusUpdate(o.id, sel.value);
                            }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded disabled:opacity-50"
                          >
                            {updatingId === o.id ? 'Updating...' : 'Update Status'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
