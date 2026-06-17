#!/usr/bin/env ts-node
/**
 * Create or promote admin user
 * Usage: npx ts-node scripts/create-admin.ts <email> [password]
 */

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email) {
    console.error('Usage: npx ts-node scripts/create-admin.ts <email> [password]')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })
    console.log(`✅ User ${email} promoted to ADMIN`)
  } else {
    if (!password) {
      console.error('Password required for new user')
      process.exit(1)
    }
    // Hash password (bcrypt should be used in production — this is a quick setup helper)
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        role: 'ADMIN',
        isActive: true,
      },
    })
    console.log(`✅ Admin user created: ${email}`)
    console.log('⚠️  Set password via your auth provider settings')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
