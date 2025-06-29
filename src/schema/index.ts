// src/schema/index.ts
import { z } from 'zod';


export const InvoiceDetailSchema = z.object({
  product: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
});

export const UserSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ExpenseWithDetailsSchema = z.object({
  total: z.number().positive(),
  moneda: z.enum(['CRC', 'USD']),
  proveedor: z.string().nullable().optional(),
  descripcion: z.string(),
  tipo: z.enum(['simple', 'invoice']),
  categoria: z
    .enum([
      'FOOD',
      'TRANSPORT',
      'MEDICAL',
      'SERVICES',
      'SUBSCRIPTIONS',
      'INSTALLMENTS',
      'ENTERTAINMENT',
      'HOUSEHOLD',
      'EDUCATION',
      'OTHER',
    ])
    .optional(),
  fecha: z.string().datetime().nullable().optional(),
  detalles: z.array(InvoiceDetailSchema).optional(),
});
