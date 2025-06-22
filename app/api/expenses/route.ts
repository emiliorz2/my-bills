// app/api/expenses/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
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
    const expenses = await prisma.expense.findMany({
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
    const { id } = await request.json();

    const deletedExpense = await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: deletedExpense });
  } catch (error) {
    console.error('[API DELETE ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar el gasto' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, source, expense } = await request.json();

    const updatedSource = await prisma.source.update({
      where: { id: source.id },
      data: {
        type: source.type,
        description: source.description,
        receivedAt: new Date(source.receivedAt),
        fileUrl: source.fileUrl || null,
      },
    });

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        sourceId: updatedSource.id,
        vendor: expense.vendor,
        description: expense.description,
        date: new Date(expense.date),
        total: expense.total,
        currency: expense.currency,
        expenseType: expense.expenseType,
        category: expense.categoria || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedExpense });
  } catch (error) {
    console.error('[API PUT ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar el gasto' }, { status: 500 });
  }
}
