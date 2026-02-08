// app/api/processBill/text/route.ts
//
// Usado por: app/new-bill/page.tsx

import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ExpenseWithDetailsSchema } from '@/src/schema';
import { getDemoUser } from '@/lib/demo-user';

// Procesa un mensaje de texto con OpenAI y registra el gasto
export async function POST(req: Request) {
  try {
    const demoUser = await getDemoUser();

    const { message } = await req.json();

    const prompt = `
Extrae la siguiente información de este gasto escrito en lenguaje natural:

- total (como número)
- moneda (solo CRC o USD)
- proveedor o persona (si aplica)
- descripción corta
- tipo de gasto: 'simple' si es una frase como "5000 colones a la pulpería", o 'invoice' si parece una factura con múltiples productos.
- categoría: una sola palabra en mayúsculas. Escoge de estas opciones:
  - FOOD
  - TRANSPORT
  - MEDICAL
  - SERVICES
  - SUBSCRIPTIONS
  - INSTALLMENTS
  - ENTERTAINMENT
  - HOUSEHOLD
  - EDUCATION
  - OTHER
- si aparece una fecha en el texto, devuelve "fecha": "2025-06-21T00:00:00.000Z" en formato ISO. Si no aparece, devuelve "fecha": null.

Devuelve SOLO este objeto JSON con esta estructura en base al texto proporcionado:

{
  "total": 18900,
  "moneda": "CRC",
  "proveedor": "Supermercado XYZ",
  "descripcion": "Compra de víveres",
  "tipo": "invoice",
  "categoria": "FOOD",
  "fecha": "2025-06-21T00:00:00.000Z",
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

    // Envía el texto a OpenAI para extraer la información
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    // Respuesta de OpenAI en JSON
    const raw = completion.choices[0].message.content ?? '';
    console.log('🔍 Respuesta cruda de OpenAI:', raw);

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(raw);
    } catch (err) {
      console.error('❌ JSON malformado:', err, raw);
      return NextResponse.json(
        { success: false, error: 'Formato de respuesta inválido del modelo' },
        { status: 500 }
      );
    }
    // Valida el esquema recibido
    const result = ExpenseWithDetailsSchema.safeParse(parsedJSON);
    if (!result.success) {
      console.warn('❌ Error de validación Zod:', result.error);
      return NextResponse.json({ success: false, error: 'Respuesta inválida de OpenAI' }, { status: 400 });
    }

    const data = result.data;

    // Crea el registro de origen tipo mensaje
    const source = await prisma.source.create({
      data: {
        type: 'message',
        description: 'Registro por texto',
        receivedAt: new Date(),
      },
    });

    // Guarda el gasto en la base de datos
    const expense = await prisma.expense.create({
      data: {
        sourceId: source.id,
        vendor: data.proveedor || null,
        description: data.descripcion,
        date: data.fecha ? new Date(data.fecha) : new Date(),
        total: data.total,
        currency: data.moneda,
        expenseType: data.tipo,
        category: data.categoria ?? 'OTHER',
        userId: demoUser.id,
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
        categoria: expense.category,
        proveedor: expense.vendor,
        detalles: data.tipo === 'invoice' ? data.detalles || [] : [],
      },
    });
  } catch (err) {
    console.error('❌ ERROR en /processBill/text:', err);
    // Error inesperado al procesar el mensaje
    return NextResponse.json({ success: false, error: 'Error procesando texto' }, { status: 500 });
  }
}
