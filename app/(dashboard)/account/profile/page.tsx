import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/account/ProfileForm'

export default async function AccountProfilePage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, phone: true },
  })
  if (!user) redirect('/login')

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Settings</h2>
      <ProfileForm user={user} />
    </div>
  )
}
