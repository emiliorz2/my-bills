// app/api/expenses/route.ts
//
// Usado por:
// - src/hooks/useBills.ts (GET y DELETE)
// - app/bills/[id]/edit/page.tsx (GET y PUT)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';

const SourceSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['message', 'image']),
  description: z.string().optional(),
  receivedAt: z.string().datetime(),
  fileUrl: z.string().url().nullable().optional(),
});

const ExpenseSchema = z.object({
  vendor: z.string().max(100).nullable().optional(),
  description: z.string(),
  date: z.string().datetime(),
  total: z.number(),
  currency: z.enum(['CRC', 'USD']),
  expenseType: z.enum(['simple', 'invoice']),
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
    .nullable()
    .optional(),
});

const BodySchema = z.object({
  source: SourceSchema,
  expense: ExpenseSchema,
  id: z.number().optional(),
});

// Crea un gasto manual (actualmente no utilizado directamente desde el cliente)
export async function POST(request: Request) {
  try {
    // Verifica que el usuario esté autenticado
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Extrae y valida el cuerpo de la petición
    const json = await request.json();
    const parseResult = BodySchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { source, expense } = parseResult.data;

    // Crea el registro de origen (imagen o mensaje)
    const newSource = await prisma.source.create({
      data: {
        type: source.type,
        description: source.description,
        receivedAt: new Date(source.receivedAt),
        fileUrl: source.fileUrl || null,
      },
    });

    // Guarda el gasto relacionado con el usuario
    const newExpense = await prisma.expense.create({
      data: {
        sourceId: newSource.id,
        userId: Number(session.user.id),
        vendor: expense.vendor,
        description: expense.description,
        date: new Date(expense.date),
        total: expense.total,
        currency: expense.currency,
        expenseType: expense.expenseType,
        category: expense.categoria || null,
      },
    });

    // Devuelve el gasto creado
    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    console.error('[API POST ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error al registrar el gasto' }, { status: 500 });
  }
}

// Devuelve la lista de gastos del usuario
// Llamado desde src/hooks/useBills.ts
export async function GET() {
  try {
    // Comprueba que el usuario esté autenticado
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = Number((session.user as { id: string }).id);

    // Obtiene todos los gastos ordenados por fecha y con sus relaciones
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        source: true,
        invoiceDetails: true,
      },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error('[API GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener los gastos' },
      { status: 500 }
    );
  }
}

// Elimina un gasto específico
// Llamado desde src/hooks/useBills.ts
export async function DELETE(request: Request) {
  try {
    // Verifica autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtiene el ID a eliminar
    const { id } = await request.json();
    const userId = Number((session.user as { id: string }).id);

    // Elimina el gasto que coincida con el usuario
    const deleted = await prisma.expense.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API DELETE ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el gasto' },
      { status: 500 }
    );
  }
}

// Actualiza un gasto existente
// Utilizado en app/bills/[id]/edit/page.tsx
export async function PUT(request: Request) {
  try {
    // Verifica sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Valida el cuerpo y extrae datos
    const json = await request.json();
    const parseResult = BodySchema.safeParse(json);
    if (!parseResult.success || parseResult.data.id === undefined) {
      return NextResponse.json(
        { success: false, error: parseResult.success ? 'ID requerido' : parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { id, source, expense } = parseResult.data;
    const userId = Number((session.user as { id: string }).id);

    // Comprueba que el gasto exista y pertenezca al usuario
    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    // Actualiza primero el source
    const updatedSource = await prisma.source.update({
      where: { id: source.id },
      data: {
        type: source.type,
        description: source.description,
        receivedAt: new Date(source.receivedAt),
        fileUrl: source.fileUrl || null,
      },
    });

    // Luego actualiza el gasto
    const updatedExpense = await prisma.expense.updateMany({
      where: { id, userId },
      data: {
        sourceId: updatedSource.id,
        userId,
        vendor: expense.vendor,
        description: expense.description,
        date: new Date(expense.date),
        total: expense.total,
        currency: expense.currency,
        expenseType: expense.expenseType,
        category: expense.categoria || null,
      },
    });

    if (updatedExpense.count === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    // Devuelve la versión actualizada del gasto
    const refreshed = await prisma.expense.findFirst({
      where: { id, userId },
      include: { source: true, invoiceDetails: true }
    })

    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    console.error('[API PUT ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el gasto' },
      { status: 500 }
    );
  }
}
