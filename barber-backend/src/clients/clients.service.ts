import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
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
    // CORREÇÃO: O filtro de barbershopId agora é obrigatório
    const whereClause: Prisma.ClientWhereInput = {
      barbershopId: barbershopId,
    };

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

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    // CORREÇÃO: Trava do Tenant obrigatória
    if (client.barbershopId !== barbershopId) {
      throw new ForbiddenException('Cliente não encontrado ou acesso negado.');
    }

    if (role === 'BARBER' && client.barberId !== barberId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar os dados deste cliente.',
      );
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    await this.findOne(id, barbershopId, role, barberId);

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(
    id: string,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    await this.findOne(id, barbershopId, role, barberId);

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
