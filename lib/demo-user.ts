import { prisma } from '@/lib/prisma';

const DEMO_USER_EMAIL = 'demo@my-bills.local';

export async function getDemoUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: 'Invitado',
      password: 'demo',
    },
  });
}
