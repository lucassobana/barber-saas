import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
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
        barberId:
          role === 'BARBER' ? barberId : createServiceDto.barberId || null,
      },
    });
  }

  async findAll(barbershopId: string, role: Role, barberId: string | null) {
    // CORREÇÃO: O filtro de barbershopId agora é obrigatório
    const whereClause: Prisma.ServiceWhereInput = {
      barbershopId: barbershopId,
    };

    if (role === 'BARBER') {
      whereClause.OR = [{ barberId: barberId! }, { barberId: null }];
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

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    // CORREÇÃO: Trava do Tenant obrigatória
    if (service.barbershopId !== barbershopId) {
      throw new ForbiddenException('Serviço não encontrado ou acesso negado.');
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

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    await this.findOne(id, barbershopId, role, barberId);

    if (
      role === 'BARBER' &&
      updateServiceDto.barberId !== undefined &&
      updateServiceDto.barberId !== barberId
    ) {
      throw new ForbiddenException(
        'Você não pode transferir a posse deste serviço.',
      );
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(
    id: string,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    await this.findOne(id, barbershopId, role, barberId);

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
