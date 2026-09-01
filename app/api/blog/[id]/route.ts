import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// PUT /api/blog/[id] - Update blog post
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, imageUrl, published } = body;

    const blog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        published,
      },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('PUT /api/blog/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.blog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/blog/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
