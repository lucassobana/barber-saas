import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClientDto: CreateClientDto,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    return this.prisma.client.create({
      data: {
        ...createClientDto,
        barbershopId,
        barberId: role === 'BARBER' ? barberId : null,
      },
    });
  }

  async findAll(barbershopId: string, role: Role, barberId: string | null) {
    // Usamos a tipagem exata do Prisma ao invés de "any"
    const whereClause: Prisma.ClientWhereInput = { barbershopId };

    if (role === 'BARBER') {
      whereClause.barberId = barberId;
    }

    return this.prisma.client.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(
    id: string,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client || client.barbershopId !== barbershopId) {
      throw new ForbiddenException('Cliente não encontrado.');
    }

    if (role === 'BARBER' && client.barberId !== barberId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este cliente.',
      );
    }

    return client;
  }
}
