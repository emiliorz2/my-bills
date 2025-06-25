// app/api/expenses/[id]/route.ts
//
// Usado por:
// - app/bills/[id]/edit/page.tsx (GET y PUT)
// - src/hooks/useBills.ts (DELETE)
import { NextResponse } from 'next/server';
import type { RouteHandlerContext } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Devuelve un gasto específico para edición
// Utilizado en app/bills/[id]/edit/page.tsx
export async function GET(
  request: Request,
  context: RouteHandlerContext<{ id: string }>
) {

  // Extrae y valida el id de la ruta
  // Id de la factura a actualizar
  const { id: idRaw } = await context.params;
  const id = Number(idRaw);
  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'ID inválido' }, { status: 400 });
  }

  // Verifica autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }
  const userId = Number((session.user as { id: string }).id);

  try {
    // Busca el gasto junto con su fuente y detalles
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
      include: {
        invoiceDetails: true,
        source: true,
      },
    });

    if (!expense) {
      // No existe o no pertenece al usuario
      return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch {
    // Error inesperado
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}

// Actualiza un gasto existente
// Utilizado en app/bills/[id]/edit/page.tsx
export async function PUT(
  request: Request,
  context: RouteHandlerContext<{ id: string }>
) {

  const { id: idRaw } = await context.params;
  const id = Number(idRaw);
  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'ID inválido' }, { status: 400 });
  }

  const body = await request.json();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }
  const userId = Number((session.user as { id: string }).id);

  try {
    // Actualiza el registro en base al cuerpo recibido
    const updated = await prisma.expense.updateMany({
      where: { id, userId },
      data: {
        vendor: body.vendor,
        description: body.description,
        total: body.total,
        currency: body.currency,
        category: body.categoria || null,
      },
    });

    if (updated.count === 0) {
      // El gasto no existe o no pertenece al usuario
      return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });
    }

    // Obtiene el registro actualizado con sus relaciones
    const refreshed = await prisma.expense.findFirst({
      where: { id, userId },
      include: { invoiceDetails: true, source: true }
    })

    return NextResponse.json({ success: true, data: refreshed });
  } catch {
    // Error al actualizar en base de datos
    return NextResponse.json({ success: false, message: 'Error al actualizar' }, { status: 500 });
  }
}



// Elimina una factura y sus registros asociados
// Llamado desde src/hooks/useBills.ts
export async function DELETE(
  request: Request,
  context: RouteHandlerContext<{ id: string }>
) {
  try {
    // Verifica autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    // Id del gasto a eliminar
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);

    const userId = Number((session.user as { id: string }).id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // Comprueba existencia
    const expense = await prisma.expense.findFirst({ where: { id, userId } });

    if (!expense) {
      return NextResponse.json({ success: false, error: 'Factura no encontrada' }, { status: 404 });
    }

    // Primero elimina los detalles relacionados
    await prisma.invoiceDetail.deleteMany({
      where: { expenseId: id },
    });

    // Luego elimina el gasto
    await prisma.expense.delete({
      where: { id },
    });

    // Finalmente elimina el source asociado
    await prisma.source.delete({
      where: { id: expense.sourceId },
    });

    return NextResponse.json({ success: true });
  } catch {
    console.error('[DELETE /expenses/:id]');
    // Error al eliminar en la base de datos
    return NextResponse.json({ success: false, error: 'Error al eliminar la factura' }, { status: 500 });
  }
}