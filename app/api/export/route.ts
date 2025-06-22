// app/api/export/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany();
    const invoiceDetails = await prisma.invoiceDetail.findMany();
    const sources = await prisma.source.findMany();

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        invoiceDetails,
        sources,
      },
    });
  } catch (error) {
    console.error('[EXPORT API ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Error al exportar los datos' },
      { status: 500 }
    );
  }
}
