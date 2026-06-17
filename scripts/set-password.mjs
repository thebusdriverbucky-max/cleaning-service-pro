import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'neodesignengineering@gmail.com'
  const password = 'adminpassword'
  const passwordHash = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    })
    console.log(`Updated password for ${email}. You can now login with password: ${password}`)
  } else {
    console.log('User not found')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
