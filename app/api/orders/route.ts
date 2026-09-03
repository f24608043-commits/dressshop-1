import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';
import { checkoutSchema } from '@/lib/validations/checkout';

// GET /api/orders - List orders for authenticated customer or all orders for admin
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const role = await getUserRole();
    const isAdmin = role === 'ADMIN';

    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        coupon:coupons(code, discount_type, discount_value)
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: orders } = await query;

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Atomic Checkout & Database Transaction Endpoint
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const body = await req.json();
    const validatedData = checkoutSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid checkout payload', details: validatedData.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const {
      customerName,
      customerEmail,
      phone,
      address,
      city,
      province,
      postalCode,
      couponCode,
      items,
    } = validatedData.data;

    let subtotal = 0;
    const orderItemDatas = [];
    const stockUpdates = [];

    // 1. Verify Products, Variations, Stock & Calculate Real Subtotal
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .single();

      if (!product) {
        throw new Error(`Product "${item.productId}" is no longer available.`);
      }

      let unitPrice = Number(product.base_price);
      let currentStock = product.stock ?? 0;
      let variationSku: string | null = null;
      let selectedOptionsData: any = undefined;

      if (product.product_type === 'VARIABLE' && item.variationId) {
        const { data: variation } = await supabase
          .from('product_variations')
          .select(`
            *,
            values:product_variation_values(
              *,
              option_value:product_option_values(*),
              option:product_options(*)
            )
          `)
          .eq('id', item.variationId)
          .single();

        if (!variation) {
          throw new Error(`Selected variation for product "${product.name}" is unavailable.`);
        }

        unitPrice = Number(variation.price);
        currentStock = variation.stock;
        variationSku = variation.sku;
        selectedOptionsData = variation.values?.map((v: any) => ({
          option: v.option_value?.option?.name,
          value: v.option_value?.value,
        }));

        stockUpdates.push({
          table: 'product_variations',
          id: item.variationId!,
          decrement: item.quantity,
        });
      } else {
        stockUpdates.push({
          table: 'products',
          id: product.id,
          decrement: item.quantity,
        });
      }

      // Verify stock sufficiency
      if (currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${currentStock}, Requested: ${item.quantity}`
        );
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemDatas.push({
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        variation_id: item.variationId || null,
        variation_sku: variationSku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        selected_options: selectedOptionsData,
      });
    }

    // 2. Validate Coupon & Calculate Discount
    let discount = 0;
    let appliedCouponId: string | null = null;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (!coupon || !coupon.active) {
        throw new Error('Invalid or inactive coupon code.');
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('Coupon has expired.');
      }

      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        throw new Error('Coupon usage limit reached.');
      }

      if (subtotal < Number(coupon.min_order_value || 0)) {
        throw new Error(`Minimum order value of Rs. ${coupon.min_order_value} required for coupon.`);
      }

      const discountVal = Number(coupon.discount_value);
      if (coupon.discount_type === 'PERCENTAGE') {
        discount = (subtotal * discountVal) / 100;
      } else {
        discount = Math.min(discountVal, subtotal);
      }

      appliedCouponId = coupon.id;

      // Increment coupon usage count
      await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);
    }

    const finalTotal = Math.max(0, subtotal - discount);

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'PENDING',
        subtotal,
        discount,
        total: finalTotal,
        customer_name: customerName,
        customer_email: customerEmail,
        phone,
        address,
        city,
        province,
        postal_code: postalCode,
        coupon_id: appliedCouponId,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Supabase order insert error:', orderError);
      throw new Error('Failed to create order');
    }

    // 4. Create Order Items
    const orderItemsWithOrderId = orderItemDatas.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      throw new Error('Failed to create order items');
    }

    // 5. Decrease Stock
    for (const update of stockUpdates) {
      const { data: current } = await supabase
        .from(update.table)
        .select('stock')
        .eq('id', update.id)
        .single();

      if (current) {
        await supabase
          .from(update.table)
          .update({ stock: Math.max(0, current.stock - update.decrement) })
          .eq('id', update.id);
      }
    }

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        orderId: order.id,
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed due to a server transaction error.' },
      { status: 400 }
    );
  }
}
