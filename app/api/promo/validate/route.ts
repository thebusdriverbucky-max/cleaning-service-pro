import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promo) {
      return NextResponse.json({ valid: false, error: 'Promo code not found' })
    }

    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: 'Promo code is inactive' })
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Promo code has expired' })
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: 'Promo code usage limit reached' })
    }

    return NextResponse.json({
      valid: true,
      discountValue: promo.discountValue,
      discountType: promo.discountType,
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
