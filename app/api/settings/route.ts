// app/api/settings/route.ts
//
// Usado por:
// - src/hooks/useSettings.ts (en app/page.tsx y app/settings/page.tsx)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/lib/generated/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

// Obtiene la configuración del usuario actual
export async function GET() {
  // Verifica autenticación
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }
  // Busca la configuración única de este usuario
  const userId = Number((session.user as { id: string }).id)
  const setting = await prisma.setting.findUnique({ where: { userId } })
  return NextResponse.json({ success: true, data: setting })
}

// Actualiza o crea la configuración del usuario
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }
  // Datos enviados por el cliente
  const body = await request.json()
  const userId = Number((session.user as { id: string }).id)
  const { preferredCurrency, exchangeRate, monthlyBudget } = body
  try {
    // Campos a actualizar
    const updateData: Prisma.SettingUncheckedUpdateInput = {}
    if (preferredCurrency !== undefined) updateData.preferredCurrency = preferredCurrency
    if (exchangeRate !== undefined) updateData.exchangeRate = exchangeRate
    if (monthlyBudget !== undefined) updateData.monthlyBudget = monthlyBudget

    // Valores por defecto si no existe registro
    const createData: Prisma.SettingUncheckedCreateInput = {
      userId,
      preferredCurrency: preferredCurrency ?? 'CRC',
      monthlyBudget: monthlyBudget ?? 0,
    }
    if (exchangeRate !== undefined) createData.exchangeRate = exchangeRate


    // Crea o actualiza la configuración en una sola operación
    const updated = await prisma.setting.upsert({
      where: { userId },
      update: updateData,
      create: createData,
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[SETTINGS PUT ERROR]', error)
    // Error al guardar los ajustes en la base de datos
    return NextResponse.json({ success: false, error: 'Error al guardar ajustes' }, { status: 500 })
  }
}
