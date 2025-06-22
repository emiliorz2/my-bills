//app/api/processBill/text/route.ts

import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema
const InvoiceDetailSchema = z.object({
  product: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
});

const ExpenseWithDetailsSchema = z.object({
  total: z.number().positive(),
  moneda: z.enum(['CRC', 'USD']),
  proveedor: z.string().optional(),
  descripcion: z.string(),
  tipo: z.enum(['simple', 'invoice']),
  detalles: z.array(InvoiceDetailSchema).optional(),
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const prompt = `
Extrae la siguiente información de este gasto escrito en lenguaje natural:

- total (como número)
- moneda (solo CRC o USD)
- proveedor o persona (si aplica)
- descripción corta
- tipo de gasto: 'simple' si es una frase como "5000 colones a la pulpería", o 'invoice' si parece una factura con múltiples productos.
- Si es una factura, devuelve también los detalles de los productos (nombre, cantidad, precio unitario).

Devuelve **únicamente** este objeto JSON con esta estructura en base a la información extraída del texto:

{
  "total": 18900,
  "moneda": "CRC",
  "proveedor": "Supermercado XYZ",
  "descripcion": "Compra de víveres",
  "tipo": "invoice",
  "detalles": [
    {
      "product": "Leche",
      "quantity": 2,
      "unitPrice": 900
    },
    {
      "product": "Pan",
      "quantity": 1,
      "unitPrice": 1200
    }
  ]
}

Texto: ${message}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const raw = completion.choices[0].message.content ?? '';
    console.log('🔍 Respuesta cruda de OpenAI:', raw);

    const parsedJSON = JSON.parse(raw);
    const result = ExpenseWithDetailsSchema.safeParse(parsedJSON);
    if (!result.success) {
      console.warn('❌ Error de validación Zod:', result.error);
      return NextResponse.json({ success: false, error: 'Respuesta inválida de OpenAI' }, { status: 400 });
    }

    const data = result.data;

    const source = await prisma.source.create({
      data: {
        type: 'message',
        description: 'Registro por texto',
        receivedAt: new Date(),
      },
    });

    const expense = await prisma.expense.create({
      data: {
        sourceId: source.id,
        vendor: data.proveedor || null,
        description: data.descripcion,
        date: new Date(),
        total: data.total,
        currency: data.moneda,
        expenseType: data.tipo,
      },
    });

    // Si hay detalles y el tipo es factura, guardamos los productos
    if (data.tipo === 'invoice' && data.detalles?.length) {
      const detalles = data.detalles.map((item) => ({
        expenseId: expense.id,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await prisma.invoiceDetail.createMany({ data: detalles });
    }

return NextResponse.json({
  success: true,
  data: {
    descripcion: expense.description,
    total: expense.total,
    moneda: expense.currency,
    tipo: expense.expenseType,
    proveedor: expense.vendor,
    detalles: data.tipo === 'invoice' ? data.detalles || [] : [],
  },
});  } catch (err) {
    console.error('❌ ERROR en /processBill/text:', err);
    return NextResponse.json({ success: false, error: 'Error procesando texto' }, { status: 500 });
  }
}


// Métodos no permitidos
export async function GET() {
  return NextResponse.json({ success: false, error: 'Método GET no permitido' }, { status: 405 });
}


export async function PUT() {
  return NextResponse.json({ success: false, error: 'Método PUT no permitido en esta ruta' }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Método DELETE no permitido en esta ruta' }, { status: 405 });
}