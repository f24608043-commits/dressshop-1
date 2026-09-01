import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// GET /api/blog - Public listing of published blog posts
export async function GET() {
  try {
    const posts = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST /api/blog - Create new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, imageUrl, published } = body;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        published: published || false,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('POST /api/blog error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
