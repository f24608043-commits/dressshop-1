import React from 'react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Newsletter Subscribers</h1>
          <p className="text-xs text-gray-500 mt-1">Manage email subscribers and contact messages.</p>
        </div>
        <div className="text-sm font-bold text-gray-700">
          Total: {subscribers.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 font-bold text-gray-700">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Message</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono font-bold text-gray-900">{sub.id}</td>
                <td className="p-3 font-medium text-gray-800">{sub.name || 'N/A'}</td>
                <td className="p-3 font-medium text-gray-800">{sub.email}</td>
                <td className="p-3 text-gray-600 max-w-xs truncate">{sub.message || 'N/A'}</td>
                <td className="p-3 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {subscribers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No subscribers or contact messages found.</p>
        </div>
      )}
    </div>
  );
}
