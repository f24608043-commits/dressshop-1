import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';

// Helper function to generate Cartesian Product of arrays
function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
    [[]]
  );
}

// POST /api/products/[id]/variations/generate - Automatically generate combinations
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return auth.response;
    }

    const { id: productId } = await params;
    const supabase = await createClient();

    // Fetch product with linked product options
    const { data: product } = await supabase
      .from('products')
      .select('*, options:product_options(*, values:product_option_values(*))')
      .eq('id', productId)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const allOptionGroups = product.options || [];

    if (allOptionGroups.length === 0) {
      return NextResponse.json(
        { error: 'No option groups found for this product. Add Product Options first.' },
        { status: 400 }
      );
    }

    // Extract arrays of option values per group
    const valueArrays = allOptionGroups.map((group: any) => group.values || []);

    // Compute Cartesian product combinations
    const combinations = cartesianProduct(valueArrays);

    const basePrice = Number(product.base_price);

    // Delete old variations
    await supabase
      .from('product_variations')
      .delete()
      .eq('product_id', productId);

    const variations = [];

    for (let i = 0; i < combinations.length; i++) {
      const combo = combinations[i];
      
      // Sum total price adjustment from selected option values
      const totalAdjustment = combo.reduce((sum: number, val: any) => sum + Number(val.price_adjustment || 0), 0);
      const finalPrice = basePrice + totalAdjustment;

      // Construct SKU: e.g. BED-5FT-VEL-BLK-1
      const skuPrefix = combo.map((v: any) => (v.value || '').substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')).join('-');
      const sku = `${(product.slug || '').substring(0, 4).toUpperCase()}-${skuPrefix}-${i + 1}`;

      const { data: variation } = await supabase
        .from('product_variations')
        .insert({
          product_id: productId,
          sku,
          price: finalPrice,
          stock: 10,
        })
        .select()
        .single();

      if (variation) {
        // Create variation values
        const variationValues = combo.map((val: any) => ({
          variation_id: variation.id,
          option_value_id: val.id,
        }));

        await supabase
          .from('product_variation_values')
          .insert(variationValues);

        variations.push({ ...variation, values: combo });
      }
    }

    // Update product type to VARIABLE
    await supabase
      .from('products')
      .update({ product_type: 'VARIABLE', stock: null })
      .eq('id', productId);

    return NextResponse.json(
      {
        message: `Successfully generated ${variations.length} combinations`,
        totalGenerated: variations.length,
        variations,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/products/[id]/variations/generate error:', error);
    return NextResponse.json({ error: 'Failed to generate product variations' }, { status: 500 });
  }
}

