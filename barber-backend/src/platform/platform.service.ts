import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  // 1. CRIAÇÃO SaaS
  async createPlatform(dto: CreatePlatformDto) {
    const existingShop = await this.prisma.barbershop.findUnique({
      where: { slug: dto.slug },
    });

    if (existingShop) {
      throw new ConflictException('Já existe uma barbearia com este slug.');
    }

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

      // Cria ou busca o dono
      let user = await tx.user.findUnique({ where: { email: dto.ownerEmail } });

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

      // CORREÇÃO: O dono da barbearia é o OWNER, não o ADMIN global
      await tx.userBarbershop.create({
        data: {
          userId: user.id,
          barbershopId: barbershop.id,
          role: Role.OWNER,
        },
      });

      return {
        message: 'Barbearia e Proprietário criados com sucesso!',
        barbershop,
      };
    });
  }

  // 2. LISTAGEM GERAL
  async findAll() {
    return this.prisma.barbershop.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // 3. BUSCA POR ID
  async findOne(id: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });

    if (!barbershop) {
      throw new NotFoundException('Barbearia não encontrada.');
    }

    return barbershop;
  }

  // 4. ATUALIZAÇÃO
  async update(id: string, updateDto: UpdatePlatformDto) {
    await this.findOne(id); // Garante que existe antes de atualizar

    return this.prisma.barbershop.update({
      where: { id },
      data: {
        // Ignora os dados do Owner aqui, atualiza apenas dados físicos da loja
        name: updateDto.name,
        slug: updateDto.slug,
        openTime: updateDto.openTime,
        closeTime: updateDto.closeTime,
        openDays: updateDto.openDays,
      },
    });
  }

  // 5. EXCLUSÃO
  async remove(id: string) {
    await this.findOne(id); // Garante que existe antes de deletar

    // O Cascade do Prisma (se configurado no schema) se encarregará de
    // apagar os serviços, clientes e agendas vinculados a esta barbearia.
    return this.prisma.barbershop.delete({
      where: { id },
    });
  }
}
