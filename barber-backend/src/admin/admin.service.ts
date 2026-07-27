import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'node:crypto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Recebemos os dados agrupados em um objeto, incluindo isBarber e ownerName
  async createTenant(data: {
    barbershopName: string;
    ownerName: string;
    ownerEmail: string;
    openTime: string;
    closeTime: string;
    isBarber: boolean;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.ownerEmail },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Este e-mail já possui cadastro no sistema.',
      );
    }

    // Geração do token para criar a senha depois[cite: 18]
    const rawToken = crypto.randomBytes(32).toString('hex');
    console.log('TOKEN DO DONO PARA TESTE:', rawToken);

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const result = await this.prisma.$transaction(async (prisma) => {
      const generatedSlug = data.barbershopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // 1. Cria a Barbearia[cite: 18]
      const barbershop = await prisma.barbershop.create({
        data: {
          name: data.barbershopName,
          slug: generatedSlug,
          openTime: data.openTime,
          closeTime: data.closeTime,
        },
      });

      // 2. Cria o Usuário Dono (Pendente de senha)[cite: 18]
      const user = await prisma.user.create({
        data: {
          name: data.ownerName, // Agora salva o nome corretamente
          email: data.ownerEmail,
          password: '', // Senha vazia, será definida no link do e-mail[cite: 18]
          status: 'PENDING', //[cite: 18]
          inviteToken: tokenHash, //[cite: 18]
          inviteExpires: expiresAt, //[cite: 18]
          memberships: {
            create: {
              barbershopId: barbershop.id,
              role: 'OWNER', // Pode manter 'ADMIN' se o seu schema Prisma não tiver 'OWNER'
            },
          },
        },
      });

      // 3. Regra de Negócio: Se o dono atende clientes, cria a agenda dele
      // 3. Regra de Negócio: Se o dono atende clientes, cria a agenda dele
      let barberId: string | null = null; // Tipagem explícita para aceitar string ou nulo

      if (data.isBarber) {
        const barber = await prisma.barber.create({
          data: {
            name: data.ownerName,
            email: data.ownerEmail,
            openTime: data.openTime,
            closeTime: data.closeTime,
            status: true,
            barbershopId: barbershop.id,
            user: {
              connect: { id: user.id },
            },
          },
        });
        barberId = barber.id; // Salvamos apenas o ID
      }

      return { barbershop, user, barberId };
    });

    // Descomente quando o Resend estiver configurado
    // await this.mailService.sendInviteEmail(data.ownerEmail, rawToken);

    return {
      message: 'Barbearia criada e convite enviado ao dono com sucesso!',
      barbershopId: result.barbershop.id,
      ownerId: result.user.id,
      barberId: result.barberId, // Retornamos o ID diretamente
    };
  }
}
