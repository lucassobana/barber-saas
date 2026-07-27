import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service'; // Lembre-se de manter este import
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Agora recebemos o nome do barbeiro e o ID da barbearia
  async createInvitedUser(email: string, name: string, barbershopId: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    console.log('TOKEN PARA TESTE (Cole na URL):', rawToken);

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // MÁGICA DO PRISMA: Cria o Usuário, a Permissão e o Barbeiro em uma tacada só!
    const user = await this.prisma.user.create({
      data: {
        name: name,
        email,
        password: '',
        status: 'PENDING',
        inviteToken: tokenHash,
        inviteExpires: expiresAt,
        // 1. Cria a permissão atrelada
        memberships: {
          create: {
            barbershopId: barbershopId,
            role: 'BARBER',
          },
        },
        // 2. Cria a agenda de barbeiro atrelada
        barber: {
          create: {
            name,
            email,
            barbershopId: barbershopId,
            status: true,
            openTime: '08:00',
            closeTime: '20:00',
          },
        },
      },
      include: {
        barber: true, // Pede para o Prisma devolver os dados do barbeiro gerado
      },
    });

    try {
      await this.mailService.sendInviteEmail(email, rawToken);
    } catch {
      console.warn(
        '\n⚠️ Aviso: O e-mail não pôde ser enviado pelo Resend (Localhost).',
      );
      console.warn('Use este token para criar a senha na URL:', rawToken, '\n');
    }

    return {
      message: 'Usuário criado com sucesso.',
      userId: user.id,
      barberId: user.barber?.id,
    };
  }
}
