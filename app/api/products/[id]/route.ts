import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { productSchema } from '@/lib/validations/product';

// GET /api/products/[id] - Fetch single product by ID or Slug
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*),
        brand:brands(*),
        global_form:global_forms(*),
        options:product_options(*),
        variations:product_variations(*),
        reviews:reviews!inner(id, rating, comment, approved, user_id, created_at, profiles(id, name))
      `)
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const avgRating =
      product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length
        : 0;

    return NextResponse.json({
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: product.reviews?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] - Admin-protected update
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    const validatedData = productSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input fields', details: validatedData.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const {
      name,
      slug,
      description,
      shortDescription,
      basePrice,
      originalPrice,
      brandId,
      categoryId,
      featured,
      stock,
      productType,
      globalFormId,
      images,
    } = validatedData.data;

    // Check slug collision
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Another product is already using this slug.' },
        { status: 409 }
      );
    }

    // Replace existing images if new images array supplied
    if (images && images.length > 0) {
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);
    }

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name,
        slug,
        description,
        short_description: shortDescription,
        base_price: basePrice,
        original_price: originalPrice || null,
        brand_id: brandId || null,
        category_id: categoryId || null,
        featured,
        stock: productType === 'SIMPLE' ? stock || 0 : null,
        product_type: productType,
        global_form_id: globalFormId || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    // Create new images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((img, idx) => ({
        url: img.url,
        alt_text: img.altText || name,
        order: img.order || idx + 1,
        product_id: id,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Failed to create product images:', imagesError);
      }
    }

    // Fetch complete product with relations
    const { data: completeProduct } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*),
        brand:brands(*)
      `)
      .eq('id', id)
      .single();

    return NextResponse.json(completeProduct);
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Admin-protected deletion
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
