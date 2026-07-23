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

    // 1. O Upsert: Busca pelo telefone ou cria um novo cliente automaticamente
    const client = await this.prisma.client.upsert({
      where: {
        // O Prisma gera esse nome composto baseado no @@unique do schema
        phone_barbershopId: {
          phone: createDto.clientPhone,
          barbershopId: barbershopId,
        },
      },
      update: {
        // Se o cliente já existir, atualiza o nome dele (caso tenha digitado diferente)
        name: createDto.clientName,
      },
      create: {
        // Se não existir, cria o cadastro com os dados básicos
        name: createDto.clientName,
        phone: createDto.clientPhone,
        barbershopId: barbershopId,
        // Se foi o barbeiro quem criou, o cliente já nasce vinculado a ele
        barberId: role === 'BARBER' ? targetBarberId : null,
      },
    });

    // 2. Cria o agendamento vinculado ao cliente (seja ele novo ou existente)
    return this.prisma.appointment.create({
      data: {
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        price: createDto.price,
        clientId: client.id, // Pegamos o ID retornado do Upsert
        serviceId: createDto.serviceId,
        barberId: targetBarberId,
        barbershopId: barbershopId,
        status: 'AGENDADO',
      },
    });
  }

  async findAll(barbershopId: string, role: Role, barberId: string | null) {
    const whereClause: Prisma.AppointmentWhereInput = { barbershopId };

    // RBAC: O barbeiro enxerga apenas a própria agenda
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
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
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

    if (!appointment || appointment.barbershopId !== barbershopId) {
      throw new ForbiddenException('Agendamento não encontrado.');
    }

    // RBAC: O barbeiro só pode alterar o status dos seus próprios agendamentos
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
}
