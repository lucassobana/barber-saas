import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados para o seed...');
  // Limpeza na ordem correta para não quebrar as relações
  await prisma.userBarbershop.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.user.deleteMany();
  await prisma.barbershop.deleteMany();

  console.log('Criando novos dados de teste...');
  const hashedPassword = await bcrypt.hash('senha123', 10);

  // 1. Criação da Barbearia (agora com SLUG)
  const barbershop = await prisma.barbershop.create({
    data: {
      name: 'Barbearia Seed',
      slug: 'barbearia-seed', // <-- Adicionamos o slug exigido
      phone: '11999999999',
      openTime: '09:00',
      closeTime: '19:00',
    },
  });

  // 2. Criação do Usuário Dono (Role na tabela intermediária)
  const ownerUser = await prisma.user.create({
    data: {
      name: 'João Dono',
      email: 'joao@teste.com',
      password: hashedPassword, // No ambiente real estaria com bcrypt
      isSuperAdmin: false,
      memberships: {
        create: {
          barbershopId: barbershop.id,
          role: Role.ADMIN, // <-- Permissão via tabela pivô
        },
      },
    },
  });

  // 3. Criação de um Usuário Barbeiro (Role na tabela intermediária)
  const barberUser = await prisma.user.create({
    data: {
      name: 'Pedro Barbeiro',
      email: 'pedro@teste.com',
      password: 'senha-hash-aqui',
      isSuperAdmin: false,
      memberships: {
        create: {
          barbershopId: barbershop.id,
          role: Role.BARBER, // <-- Permissão via tabela pivô
        },
      },
    },
  });

  console.log('✅ Seed executado com sucesso!');
  console.log(`Você pode fazer login com: ${ownerUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
