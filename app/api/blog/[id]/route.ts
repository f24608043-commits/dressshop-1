import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// PUT /api/blog/[id] - Update blog post
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { title, slug, excerpt, content, imageUrl, published } = body;

    const { data: blog, error } = await supabase
      .from('blogs')
      .update({
        title,
        slug,
        excerpt,
        content,
        image_url: imageUrl,
        published,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('PUT /api/blog/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/blog/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
