// app/api/export/route.ts
//
// Usado por:
// - components/MainContent.tsx
// - app/analytics/page.tsx

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  // Verifica que el usuario esté autenticado
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }
  const userId = Number((session.user as { id: string }).id)
  try {
    // Obtiene todos los gastos junto con sus detalles e imágenes
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { invoiceDetails: true, source: true },
    })
    const invoiceDetails = expenses.flatMap(e => e.invoiceDetails)
    const sources = expenses.map(e => e.source)

    // Devuelve todo en un único objeto
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
    // Falla al consultar la base de datos
    return NextResponse.json(
      { success: false, error: 'Error al exportar los datos' },
      { status: 500 }
    );
  }
}
