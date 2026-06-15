import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, phone } = await req.json()

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name, phone: phone || null },
  })

  return NextResponse.json({ ok: true })
}
