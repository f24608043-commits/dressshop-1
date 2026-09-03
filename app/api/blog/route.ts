import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// GET /api/blog - Public listing of published blog posts
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST /api/blog - Create new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { title, slug, excerpt, content, imageUrl, published } = body;

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert({
        title,
        slug,
        excerpt,
        content,
        image_url: imageUrl,
        published: published || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('POST /api/blog error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
