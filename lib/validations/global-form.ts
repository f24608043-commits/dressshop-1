import { z } from 'zod';

export const globalOptionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Option title is required'),
    price: z.number().min(0, 'Price must be >= 0').default(0),
    imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    description: z.string().optional().nullable(),
    enabled: z.boolean().default(true),
    inputType: z.enum(['RADIO', 'CHECKBOX', 'DROPDOWN', 'BUTTON_GROUP', 'COLOR_PICKER']).default('RADIO'),
    displayOrder: z.number().int().default(0),
    childOptions: z.array(z.lazy(() => globalOptionSchema)).optional().default([]),
  })
);

export const globalFormSchema = z.object({
  name: z.string().min(2, 'Form title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
  options: z.array(globalOptionSchema).min(1, 'At least one option is required'),
});

export const updateVariationSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
});

export type GlobalFormInput = z.infer<typeof globalFormSchema>;
export type UpdateVariationInput = z.infer<typeof updateVariationSchema>;
