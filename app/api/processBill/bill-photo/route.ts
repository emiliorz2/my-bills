//app/api/processBill/bill-photo/route.ts
//
// Usado por: app/new-bill/page.tsx
import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ExpenseWithDetailsSchema } from '@/src/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Procesa una imagen de factura con OpenAI y guarda el gasto
export async function POST(req: Request) {
  try {
    // Verifica autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Extrae la imagen enviada en el formulario
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó imagen' }, { status: 400 });
    }

    // Convierte la imagen a base64 para enviarla a OpenAI
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Solicita a OpenAI que extraiga los datos de la factura
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
- categoría: una palabra en mayúsculas. Usa solo una de estas opciones:
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
- si aplica, una lista de productos (nombre, cantidad, precio unitario)
- fecha (opcional): si aparece, debes dar la fecha y la hora en formato datetime (ejemplo: "2025-06-21T00:00:00.000Z") si no se escifica la fecha debes devolver null

Devuelve SOLO un JSON con esta estructura con la información extraída:

{
  "total": 18900,
  "moneda": "CRC",
  "proveedor": "Supermercado XYZ",
  "descripcion": "Compra en supermercado",
  "tipo": "invoice",
  "categoria": "FOOD",
  "fecha": "2025-06-21T00:00:00.000Z",
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

    // Respuesta en texto de OpenAI
    const raw = completion.choices[0].message.content ?? '';
    console.log('🔍 GPT respuesta:', raw);

    // Limpia delimitadores de código
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(cleaned);
    } catch (err) {
      console.error('❌ JSON malformado:', err, cleaned);
      return NextResponse.json(
        { success: false, error: 'Formato de respuesta inválido del modelo' },
        { status: 500 }
      );
    }

    // Valida la estructura recibida
    const result = ExpenseWithDetailsSchema.safeParse(parsedJSON);
    if (!result.success) {
      console.warn('❌ Validación fallida:', result.error);
      return NextResponse.json({ success: false, error: 'Respuesta inválida de OpenAI' }, { status: 400 });
    }

    const data = result.data;

    // Guarda el origen (imagen) en la base de datos
    const source = await prisma.source.create({
      data: {
        type: 'image',
        description: 'Factura subida',
        receivedAt: new Date(),
        fileUrl: null,
      },
    });

    // Crea el gasto utilizando los datos procesados
    const expense = await prisma.expense.create({
      data: {
        sourceId: source.id,
        vendor: data.proveedor || null,
        description: data.descripcion,
        date: data.fecha ? new Date(data.fecha) : new Date(),
        total: data.total,
        currency: data.moneda,
        expenseType: data.tipo,
        category: data.categoria,
        userId: +session.user.id,
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
        date: expense.date.toISOString(),
        total: expense.total,
        moneda: expense.currency,
        tipo: expense.expenseType,
        categoria: expense.category,
        proveedor: expense.vendor,
        detalles: data.tipo === 'invoice' ? data.detalles || [] : [],
      },
    });
  } catch (err) {
    console.error('❌ ERROR al procesar factura:', err);
    // Algo salió mal durante el procesamiento
    return NextResponse.json({ success: false, error: 'Error procesando la imagen' }, { status: 500 });
  }
}
