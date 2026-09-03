import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getUserRole } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ContactAdminPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const role = await getUserRole();

  if (!user) {
    redirect('/login?callbackUrl=/contact/admin');
  }

  if (role !== 'ADMIN') {
    return (
      <div className="text-center py-24 space-y-4 max-w-md mx-auto">
        <span className="text-5xl block">⛔</span>
        <h1 className="text-2xl font-black text-gray-900">Access Denied</h1>
        <p className="text-xs text-gray-500">You must be logged in as an administrator to access this page.</p>
      </div>
    );
  }

  const { data: contactMessages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Contact Messages</h1>
          <p className="text-xs text-gray-500 mt-1">View and manage customer contact queries.</p>
        </div>
        <div className="text-sm font-bold text-gray-700">
          Total: {(contactMessages || []).length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 font-bold text-gray-700">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Message</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(contactMessages || []).map((msg: any) => (
              <tr key={msg.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono font-bold text-gray-900">{msg.id}</td>
                <td className="p-3 font-medium text-gray-800">{msg.name || 'N/A'}</td>
                <td className="p-3 font-medium text-gray-800">{msg.email}</td>
                <td className="p-3 text-gray-600">{msg.subject || 'N/A'}</td>
                <td className="p-3 text-gray-600 max-w-xs truncate">{msg.message || 'N/A'}</td>
                <td className="p-3 text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</td>
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

      {(!contactMessages || contactMessages.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No contact messages found.</p>
        </div>
      )}
    </div>
  );
}
