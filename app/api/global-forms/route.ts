import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { globalFormSchema } from '@/lib/validations/global-form';

// GET /api/global-forms - Fetch all global forms with hierarchical options
export async function GET() {
  try {
    const globalForms = await prisma.globalForm.findMany({
      include: {
        options: {
          where: { parentId: null }, // Fetch root-level parent options
          include: {
            childOptions: {
              include: {
                childOptions: true, // Up to 2 levels of nested child options
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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

    const body = await req.json();
    const validatedData = globalFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input fields', details: validatedData.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { name, description, active, options } = validatedData.data;

    // Transaction to create GlobalForm and recursively create options & childOptions
    const newForm = await prisma.$transaction(async (tx) => {
      const form = await tx.globalForm.create({
        data: {
          name,
          description,
          active,
        },
      });

      // Recursive helper function to insert root options & child options
      async function createOptionsRecursively(optsList: any[], parentId: string | null = null) {
        for (let i = 0; i < optsList.length; i++) {
          const opt = optsList[i];
          const createdOpt = await tx.globalFormOption.create({
            data: {
              globalFormId: form.id,
              parentId: parentId,
              title: opt.title,
              price: opt.price ?? 0,
              imageUrl: opt.imageUrl || null,
              description: opt.description || null,
              enabled: opt.enabled ?? true,
              inputType: opt.inputType ?? 'RADIO',
              displayOrder: opt.displayOrder ?? i + 1,
            },
          });

          if (opt.childOptions && opt.childOptions.length > 0) {
            await createOptionsRecursively(opt.childOptions, createdOpt.id);
          }
        }
      }

      await createOptionsRecursively(options, null);

      return tx.globalForm.findUnique({
        where: { id: form.id },
        include: {
          options: {
            where: { parentId: null },
            include: {
              childOptions: {
                include: { childOptions: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('POST /api/global-forms error:', error);
    return NextResponse.json({ error: 'Failed to create global form' }, { status: 500 });
  }
}
