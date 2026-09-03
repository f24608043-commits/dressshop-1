import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { dealSchema } from '@/lib/validations/engagement';

// GET /api/deals - Fetch active bundle promotional deals
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: deals } = await supabase
      .from('deals')
      .select(`
        *,
        deal_products:deal_products(
          *,
          product:products(*, images:product_images(*))
        )
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('GET /api/deals error:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

// POST /api/deals - Admin create deal
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = await createClient();
    const body = await req.json();
    const validatedData = dealSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid deal data', details: validatedData.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { title, description, dealPrice, active, expiresAt, productIds } = validatedData.data;

    const { data: newDeal, error: dealError } = await supabase
      .from('deals')
      .insert({
        title,
        description,
        deal_price: dealPrice,
        active,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      .select()
      .single();

    if (dealError) {
      console.error('Supabase insert error:', dealError);
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }

    // Create deal products
    const dealProducts = productIds.map((pid: string) => ({
      deal_id: newDeal.id,
      product_id: pid,
    }));

    const { error: productsError } = await supabase
      .from('deal_products')
      .insert(dealProducts);

    if (productsError) {
      console.error('Failed to create deal products:', productsError);
    }

    const { data: dealWithProducts } = await supabase
      .from('deals')
      .select(`*, deal_products:deal_products(*, product:products(*))`)
      .eq('id', newDeal.id)
      .single();

    return NextResponse.json(dealWithProducts, { status: 201 });
  } catch (error) {
    console.error('POST /api/deals error:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
