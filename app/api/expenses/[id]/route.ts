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
  const userId = Number((session.user as { id: string }).id);

  try {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
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
  const userId = Number((session.user as { id: string }).id);

  try {
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
      return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });
    }

    const refreshed = await prisma.expense.findFirst({ where: { id, userId }, include: { invoiceDetails: true, source: true } })

    return NextResponse.json({ success: true, data: refreshed });
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
    const userId = Number((session.user as { id: string }).id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const expense = await prisma.expense.findFirst({ where: { id, userId } });

    if (!expense) {
      return NextResponse.json({ success: false, error: 'Factura no encontrada' }, { status: 404 });
    }

    // 1. Eliminar detalles de la factura primero
    await prisma.invoiceDetail.deleteMany({
      where: { expenseId: id },
    });

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