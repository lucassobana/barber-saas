// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Senha Forte 123', 10);

  const user = await prisma.user.upsert({
    where: {
      email: 'admin@seudominio.com',
    },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@seudominio.com',
      password: passwordHash,
      status: 'ACTIVE',
      isSuperAdmin: true,
    },
  });

  console.log('Superadmin criado:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
