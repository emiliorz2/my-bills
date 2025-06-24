import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }
  const userId = Number((session.user as { id: string }).id)
  const setting = await prisma.setting.findUnique({ where: { userId } })
  return NextResponse.json({ success: true, data: setting })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }
  const body = await request.json()
  const userId = Number((session.user as { id: string }).id)
  const { preferredCurrency, exchangeRate, monthlyBudget } = body
  try {
    const updated = await prisma.setting.upsert({
      where: { userId },
      update: { preferredCurrency, exchangeRate, monthlyBudget },
      create: { userId, preferredCurrency, exchangeRate, monthlyBudget },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[SETTINGS PUT ERROR]', error)
    return NextResponse.json({ success: false, error: 'Error al guardar ajustes' }, { status: 500 })
  }
}
