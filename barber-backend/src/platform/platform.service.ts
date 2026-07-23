import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // Importamos o Enum Role do Prisma

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  async createPlatform(dto: CreatePlatformDto) {
    // 1. Verifica se o slug já existe
    const existingShop = await this.prisma.barbershop.findUnique({
      where: { slug: dto.slug },
    });
    if (existingShop)
      throw new ConflictException('Já existe uma barbearia com este slug.');

    // 2. Cria tudo dentro de uma transação segura
    return this.prisma.$transaction(async (tx) => {
      // Cria a Barbearia
      const barbershop = await tx.barbershop.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          openTime: dto.openTime,
          closeTime: dto.closeTime,
        },
      });

      // Verifica se o email do dono já existe
      let user = await tx.user.findUnique({ where: { email: dto.ownerEmail } });

      // Se não existir, cria o usuário com a senha criptografada
      if (!user) {
        const hashedPassword = await bcrypt.hash(dto.ownerPassword, 10);
        user = await tx.user.create({
          data: {
            name: dto.ownerName,
            email: dto.ownerEmail,
            password: hashedPassword,
          },
        });
      }

      // Conecta o Usuário à Barbearia com a permissão de Dono (Usando o Enum)
      await tx.userBarbershop.create({
        data: {
          userId: user.id,
          barbershopId: barbershop.id,
          role: Role.ADMIN, // Correção aplicada aqui!
        },
      });

      return {
        message: 'Barbearia e Proprietário criados com sucesso!',
        barbershop,
      };
    });
  }
}
