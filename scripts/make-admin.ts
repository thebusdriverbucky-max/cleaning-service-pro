import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'neodesignengineering@gmail.com'
  const user = await prisma.user.findUnique({ where: { email } })
  console.log('User found:', user)
  if (user) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log('Updated user role to ADMIN:', updated)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
