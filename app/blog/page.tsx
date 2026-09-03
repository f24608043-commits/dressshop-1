import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the latest trends, styling tips, and inspiration for your bridal journey
        </p>
      </div>

      {!blogs || blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No blog posts published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: any) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {blog.image_url && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={blog.image_url}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#580520] transition-colors line-clamp-2">
                  {blog.title}
                </h2>
                {blog.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{blog.excerpt}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-xs font-bold text-[#580520] group-hover:underline">
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
