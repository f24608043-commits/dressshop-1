import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!blog || !blog.published) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-gray-600 hover:text-[#580520] mb-8 transition-colors"
      >
        ← Back to Blog
      </Link>

      {blog.image_url && (
        <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden mb-8">
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mb-4">
        <span className="text-sm text-gray-500">
          {new Date(blog.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
        {blog.title}
      </h1>

      {blog.excerpt && (
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">{blog.excerpt}</p>
      )}

      <div className="prose prose-lg max-w-none">
        <div 
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          href="/blog"
          className="inline-flex items-center px-6 py-3 bg-[#580520] hover:bg-[#7b113a] text-white font-bold text-sm rounded-lg transition-colors"
        >
          ← Back to All Posts
        </Link>
      </div>
    </div>
  );
}
