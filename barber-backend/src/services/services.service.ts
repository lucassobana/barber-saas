import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createServiceDto: CreateServiceDto,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        barbershopId,
        // Barbeiro só pode criar serviço para si mesmo
        barberId:
          role === 'BARBER' ? barberId : createServiceDto.barberId || null,
      },
    });
  }

  async findAll(barbershopId: string, role: Role, barberId: string | null) {
    const whereClause: Prisma.ServiceWhereInput = { barbershopId };

    if (role === 'BARBER') {
      // Barbeiro vê apenas seus serviços ou serviços globais (sem barbeiro específico)
      whereClause.OR = [{ barberId: barberId }, { barberId: null }];
    }

    return this.prisma.service.findMany({
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
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service || service.barbershopId !== barbershopId) {
      throw new ForbiddenException('Serviço não encontrado.');
    }

    if (
      role === 'BARBER' &&
      service.barberId !== barberId &&
      service.barberId !== null
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este serviço.',
      );
    }

    return service;
  }
}
