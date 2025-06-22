//app/api/processBill/bill-photo/route.ts

import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó imagen' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
Extrae la siguiente información de esta imagen de factura:

- total (número)
- moneda (solo CRC o USD)
- proveedor o comercio (si aparece)
- descripción corta del gasto
- tipo: 'invoice' si hay varios productos, 'simple' si es solo un total
- y si aplica, una lista de productos (nombre, cantidad, precio unitario)

Devuelve SOLO un JSON con esta estructura basado en la información extraída de la imagen:

{
  "total": 18900,
  "moneda": "CRC",
  "proveedor": "Supermercado XYZ",
  "descripcion": "Compra en supermercado",
  "tipo": "invoice",
  "detalles": [
    { "product": "Leche", "quantity": 2, "unitPrice": 900 },
    { "product": "Pan", "quantity": 1, "unitPrice": 1200 }
  ]
}
              `,
            },
            {
              type: 'image_url',
              image_url: { url: `data:${file.type};base64,${base64}` },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0].message.content ?? '';
    console.log('🔍 GPT respuesta:', raw);

    // ✅ Eliminar delimitadores Markdown si los hay
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(cleaned);
    } catch (err) {
      console.error('❌ JSON malformado:', err, cleaned);
      return NextResponse.json({ success: false, error: 'Formato de respuesta inválido del modelo' }, { status: 500 });
    }

    const result = ExpenseWithDetailsSchema.safeParse(parsedJSON);
    if (!result.success) {
      console.warn('❌ Validación fallida:', result.error);
      return NextResponse.json({ success: false, error: 'Respuesta inválida de OpenAI' }, { status: 400 });
    }

    const data = result.data;

    const source = await prisma.source.create({
      data: {
        type: 'image',
        description: 'Factura subida',
        receivedAt: new Date(),
        fileUrl: null,
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
    });
  } catch (err) {
    console.error('❌ ERROR al procesar factura:', err);
    return NextResponse.json({ success: false, error: 'Error procesando la imagen' }, { status: 500 });
  }
}
