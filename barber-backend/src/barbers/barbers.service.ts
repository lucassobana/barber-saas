import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateBarberDto } from './dto/update-barber.dto';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  // O método create() foi removido daqui!

  async findAll(barbershopId: string) {
    const whereClause: Prisma.BarberWhereInput = {
      barbershopId: barbershopId,
    };

    return this.prisma.barber.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, barbershopId: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { id },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado.');
    }

    if (barber.barbershopId !== barbershopId) {
      throw new ForbiddenException(
        'Acesso negado. Este barbeiro não pertence à sua barbearia.',
      );
    }

    return barber;
  }

  async update(
    id: string,
    updateBarberDto: UpdateBarberDto,
    barbershopId: string,
  ) {
    await this.findOne(id, barbershopId);

    return this.prisma.barber.update({
      where: { id },
      data: updateBarberDto,
    });
  }

  async remove(id: string, barbershopId: string) {
    await this.findOne(id, barbershopId);

    return this.prisma.barber.delete({
      where: { id },
    });
  }
}
