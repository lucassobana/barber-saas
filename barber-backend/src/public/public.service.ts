import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicAppointmentDto } from './dto/create-public.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getBarbershopBySlug(slug: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        openTime: true,
        closeTime: true,
        openDays: true,
        services: {
          where: { status: true }, // <-- 1. FILTRO ADICIONADO AQUI
          select: { id: true, name: true, price: true, duration: true },
        },
        barbers: {
          where: { status: true },
          select: { id: true, name: true },
        },
      },
    });

    if (!barbershop) {
      throw new NotFoundException('Barbearia não encontrada.');
    }

    return barbershop;
  }

  // Helpers matemáticos para calcular tempo
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  async getAvailableTimes(barberId: string, date: string, serviceId: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { id: barberId },
      select: { openTime: true, closeTime: true },
    });

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!barber || !service) {
      throw new BadRequestException('Barbeiro ou serviço inválido.');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        date: new Date(date),
        status: { not: 'CANCELADO' },
      },
      select: { startTime: true, endTime: true },
    });

    const openMinutes = this.timeToMinutes(barber.openTime);
    const closeMinutes = this.timeToMinutes(barber.closeTime);
    const serviceDuration = service.duration;

    const availableTimes: string[] = [];
    const interval = 30;

    for (
      let current = openMinutes;
      current + serviceDuration <= closeMinutes;
      current += interval
    ) {
      const slotStart = current;
      const slotEnd = current + serviceDuration;

      const isOccupied = appointments.some((app) => {
        const appStart = this.timeToMinutes(app.startTime);
        const appEnd = this.timeToMinutes(app.endTime);
        return slotStart < appEnd && slotEnd > appStart;
      });

      if (!isOccupied) {
        availableTimes.push(this.minutesToTime(slotStart));
      }
    }

    return availableTimes;
  }

  async createAppointment(createDto: CreatePublicAppointmentDto) {
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        barberId: createDto.barberId,
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        status: {
          not: 'CANCELED',
        },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Este horário já está reservado. Por favor, escolha outro.',
      );
    }

    // TRAVA DE SEGURANÇA BACKEND: Valida o serviço, busca o preço e a barbearia
    const service = await this.prisma.service.findUnique({
      where: { id: createDto.serviceId },
      include: {
        barbershop: true,
      },
    });

    // 2. ADICIONE A VALIDAÇÃO DO STATUS (!service.status) AQUI:
    if (
      !service ||
      service.barbershopId !== createDto.barbershopId ||
      !service.status
    ) {
      throw new BadRequestException('Serviço inválido ou inativo.');
    }

    // Solução definitiva para o ESLint: Forçamos a tipagem exata do objeto
    const barbershopData = service.barbershop as unknown as {
      openDays: string[];
    };
    const openDays = barbershopData.openDays;

    // Checa se o dia escolhido realmente faz parte dos dias que a barbearia abre
    if (openDays && openDays.length > 0) {
      const appointmentDate = new Date(createDto.date);
      // O getUTCDay() evita que problemas de fuso horário alterem o dia acidentalmente
      const dayOfWeek = appointmentDate.getUTCDay().toString();

      if (!openDays.includes(dayOfWeek)) {
        throw new BadRequestException(
          'A barbearia não realiza atendimentos neste dia da semana.',
        );
      }
    }

    const client = await this.prisma.client.upsert({
      where: {
        phone_barbershopId: {
          phone: createDto.clientPhone,
          barbershopId: createDto.barbershopId,
        },
      },
      update: {
        name: createDto.clientName,
      },
      create: {
        name: createDto.clientName,
        phone: createDto.clientPhone,
        barbershopId: createDto.barbershopId,
      },
    });

    return this.prisma.appointment.create({
      data: {
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        price: service.price,
        clientId: client.id,
        barberId: createDto.barberId,
        serviceId: createDto.serviceId,
        barbershopId: createDto.barbershopId,
        status: 'AGENDADO',
      },
    });
  }
}
