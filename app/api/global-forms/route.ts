import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { globalFormSchema } from '@/lib/validations/global-form';

// GET /api/global-forms - Fetch all global forms with hierarchical options
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: globalForms } = await supabase
      .from('global_forms')
      .select(`
        *,
        options:global_form_options(
          *,
          child_options:global_form_options(*, child_options:global_form_options(*))
        ),
        products:products(count)
      `)
      .order('created_at', { ascending: false });

    return NextResponse.json(globalForms);
  } catch (error) {
    console.error('GET /api/global-forms error:', error);
    return NextResponse.json({ error: 'Failed to fetch global forms' }, { status: 500 });
  }
}

// POST /api/global-forms - Admin creation of global reusable form
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = await createClient();
    const body = await req.json();
    const validatedData = globalFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input fields', details: validatedData.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { name, description, active, options } = validatedData.data;

    // Create GlobalForm
    const { data: form, error: formError } = await supabase
      .from('global_forms')
      .insert({ name, description, active })
      .select()
      .single();

    if (formError) {
      console.error('Supabase insert error:', formError);
      return NextResponse.json({ error: 'Failed to create global form' }, { status: 500 });
    }

    // Recursive helper function to insert root options & child options
    async function createOptionsRecursively(optsList: any[], parentId: string | null = null) {
      for (let i = 0; i < optsList.length; i++) {
        const opt = optsList[i];
        const { data: createdOpt } = await supabase
          .from('global_form_options')
          .insert({
            global_form_id: form.id,
            parent_id: parentId,
            title: opt.title,
            price: opt.price ?? 0,
            image_url: opt.imageUrl || null,
            description: opt.description || null,
            enabled: opt.enabled ?? true,
            input_type: opt.inputType ?? 'RADIO',
            display_order: opt.displayOrder ?? i + 1,
          })
          .select()
          .single();

        if (createdOpt && opt.childOptions && opt.childOptions.length > 0) {
          await createOptionsRecursively(opt.childOptions, createdOpt.id);
        }
      }
    }

    await createOptionsRecursively(options, null);

    const { data: newForm } = await supabase
      .from('global_forms')
      .select(`
        *,
        options:global_form_options(
          *,
          child_options:global_form_options(*, child_options:global_form_options(*))
        )
      `)
      .eq('id', form.id)
      .single();

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('POST /api/global-forms error:', error);
    return NextResponse.json({ error: 'Failed to create global form' }, { status: 500 });
  }
}
