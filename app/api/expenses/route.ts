// app/api/expenses/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const body = await request.json();
    const { source, expense } = body;

    const newSource = await prisma.source.create({
      data: {
        type: source.type,
        description: source.description,
        receivedAt: new Date(source.receivedAt),
        fileUrl: source.fileUrl || null,
      },
    });

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

    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    console.error('[API POST ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error al registrar el gasto' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const userId = Number((session.user as { id: string }).id);
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
    return NextResponse.json({ success: false, error: 'Error al obtener los gastos' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const { id } = await request.json();
    const userId = Number((session.user as { id: string }).id);

    const deleted = await prisma.expense.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API DELETE ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar el gasto' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const { id, source, expense } = await request.json();
    const userId = Number((session.user as { id: string }).id);

    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    const updatedSource = await prisma.source.update({
      where: { id: source.id },
      data: {
        type: source.type,
        description: source.description,
        receivedAt: new Date(source.receivedAt),
        fileUrl: source.fileUrl || null,
      },
    });

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

    const refreshed = await prisma.expense.findFirst({ where: { id, userId }, include: { source: true, invoiceDetails: true } })

    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    console.error('[API PUT ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar el gasto' }, { status: 500 });
  }
}
