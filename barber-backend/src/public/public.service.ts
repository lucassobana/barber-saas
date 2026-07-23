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
        // Retorna apenas os serviços desta barbearia
        services: {
          select: { id: true, name: true, price: true, duration: true },
        },
        // Retorna apenas os barbeiros ativos desta barbearia
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

  async createAppointment(createDto: CreatePublicAppointmentDto) {
    // 1. Valida o serviço e busca o preço direto do banco (Segurança)
    const service = await this.prisma.service.findUnique({
      where: { id: createDto.serviceId },
    });

    if (!service || service.barbershopId !== createDto.barbershopId) {
      throw new BadRequestException('Serviço inválido.');
    }

    // 2. Upsert do Cliente usando o WhatsApp (phone) e a barbearia
    const client = await this.prisma.client.upsert({
      where: {
        phone_barbershopId: {
          phone: createDto.clientPhone,
          barbershopId: createDto.barbershopId,
        },
      },
      update: {
        name: createDto.clientName, // Atualiza o nome caso ele tenha digitado diferente
      },
      create: {
        name: createDto.clientName,
        phone: createDto.clientPhone,
        barbershopId: createDto.barbershopId,
      },
    });

    // 3. Cria o Agendamento
    return this.prisma.appointment.create({
      data: {
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        price: service.price, // Preço blindado, vindo do banco
        clientId: client.id,
        barberId: createDto.barberId,
        serviceId: createDto.serviceId,
        barbershopId: createDto.barbershopId,
        status: 'AGENDADO',
      },
    });
  }
}
