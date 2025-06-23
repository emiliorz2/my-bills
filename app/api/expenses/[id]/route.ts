// app/api/expenses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        invoiceDetails: true,
        source: true,
      },
    });

    if (!expense) {
      return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch {
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await req.json();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }

  try {
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        vendor: body.vendor,
        description: body.description,
        total: body.total,
        currency: body.currency,
        category: body.categoria || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: 'Error al actualizar' }, { status: 500 });
  }
}



export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // 1. Eliminar detalles de la factura primero
    await prisma.invoiceDetail.deleteMany({
      where: { expenseId: id },
    });

    // 2. Obtener el gasto para conocer el sourceId
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ success: false, error: 'Factura no encontrada' }, { status: 404 });
    }

    // 3. Eliminar el gasto
    await prisma.expense.delete({
      where: { id },
    });

    // 4. Eliminar el source si deseas limpiarlo también
    await prisma.source.delete({
      where: { id: expense.sourceId },
    });

    return NextResponse.json({ success: true });
  } catch {
    console.error('[DELETE /expenses/:id]');
    return NextResponse.json({ success: false, error: 'Error al eliminar la factura' }, { status: 500 });
  }
}