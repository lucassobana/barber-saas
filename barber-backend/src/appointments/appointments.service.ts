import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDto: CreateAppointmentDto,
    barbershopId: string,
    role: Role,
    tokenBarberId: string | null,
  ) {
    const targetBarberId =
      role === 'BARBER' ? tokenBarberId : createDto.barberId;

    if (!targetBarberId) {
      throw new BadRequestException('É obrigatório informar o barbeiro.');
    }

    const client = await this.prisma.client.upsert({
      where: {
        phone_barbershopId: {
          phone: createDto.clientPhone,
          barbershopId: barbershopId,
        },
      },
      update: {
        name: createDto.clientName,
      },
      create: {
        name: createDto.clientName,
        phone: createDto.clientPhone,
        barbershopId: barbershopId,
        barberId: role === 'BARBER' ? targetBarberId : null,
      },
    });

    return this.prisma.appointment.create({
      data: {
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        price: createDto.price,
        clientId: client.id,
        serviceId: createDto.serviceId,
        barberId: targetBarberId,
        barbershopId: barbershopId,
        status: 'AGENDADO',
      },
    });
  }

  async findAll(
    barbershopId: string,
    role: Role,
    barberId: string | null,
    startDate?: string,
    endDate?: string,
  ) {
    // CORREÇÃO: O filtro de barbershopId agora é obrigatório e incondicional
    const whereClause: Prisma.AppointmentWhereInput = {
      barbershopId: barbershopId,
    };

    // RBAC: O barbeiro enxerga apenas a própria agenda
    if (role === 'BARBER') {
      whereClause.barberId = barberId!;
    }

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        barber: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getTodayAppointments(
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // CORREÇÃO: Filtro de barbershopId adicionado obrigatoriamente
    const whereClause: Prisma.AppointmentWhereInput = {
      barbershopId: barbershopId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    };

    if (role === 'BARBER') {
      whereClause.barberId = barberId!;
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        barber: true,
      },
      orderBy: [{ startTime: 'asc' }],
    });
  }

  async updateStatus(
    id: string,
    updateDto: UpdateStatusDto,
    barbershopId: string,
    role: Role,
    barberId: string | null,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    // CORREÇÃO: O ADMIN só pode alterar status da própria barbearia
    if (!appointment || appointment.barbershopId !== barbershopId) {
      throw new ForbiddenException(
        'Agendamento não encontrado ou sem permissão de acesso.',
      );
    }

    if (role === 'BARBER' && appointment.barberId !== barberId) {
      throw new ForbiddenException(
        'Você não pode alterar o status de um agendamento de outro barbeiro.',
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: updateDto.status },
    });
  }

  async getWeeklyAppointments(barbershopId: string, barberId?: string) {
    const now = new Date();

    // Encontra o primeiro dia da semana (Domingo)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);

    // Encontra o último dia da semana (Sábado)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        barbershopId,
        ...(barberId && { barberId }),
        date: {
          // Ajuste para 'createdAt' caso seu schema use data de criação em vez da data do agendamento
          gte: startDate,
          lte: endDate,
        },
      },
      include: { client: true, barber: true, service: true },
    });
  }

  async getMonthlyAppointments(barbershopId: string, barberId?: string) {
    const now = new Date();

    // Primeiro dia do mês atual
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    // Último dia do mês atual (O dia "0" do próximo mês)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        barbershopId,
        ...(barberId && { barberId }),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { client: true, barber: true, service: true },
    });
  }
}
