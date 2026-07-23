import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async create(createBarberDto: CreateBarberDto, barbershopId: string) {
    return this.prisma.barber.create({
      data: {
        ...createBarberDto,
        barbershopId,
      },
    });
  }

  async findAll(barbershopId: string, role: Role, barberId: string | null) {
    const whereClause: Prisma.BarberWhereInput = { barbershopId };

    // Regra RBAC: O barbeiro só enxerga o seu próprio perfil
    if (role === 'BARBER') {
      whereClause.id = barberId!;
    }

    return this.prisma.barber.findMany({
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
    const barber = await this.prisma.barber.findUnique({ where: { id } });

    if (!barber || barber.barbershopId !== barbershopId) {
      throw new ForbiddenException('Barbeiro não encontrado.');
    }

    // Bloqueia caso o barbeiro tente acessar a URL com o ID de um colega
    if (role === 'BARBER' && barber.id !== barberId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar as informações de outro barbeiro.',
      );
    }

    return barber;
  }
}
