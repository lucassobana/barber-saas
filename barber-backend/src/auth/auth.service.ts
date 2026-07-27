import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { LoginDto } from './dto/login.dto'; // Ajuste o caminho se necessário
import { Role } from '@prisma/client/wasm';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    isSuperAdmin: boolean;
    memberships: {
      userId: string;
      barbershopId: string;
      role: Role;
    }[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string, loginDto: LoginDto) {
    // 1. Busca o usuário e INCLUI as barbearias que ele faz parte
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        memberships: true, // Traz a tabela pivô UserBarbershop
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 2. Valida a senha
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Estratégia Multi-Tenant para o Token JWT
    // Se ele não for Super Admin e não tiver nenhuma barbearia, bloqueia o acesso
    if (!user.isSuperAdmin && user.memberships.length === 0) {
      throw new UnauthorizedException(
        'Usuário não está vinculado a nenhuma barbearia.',
      );
    }

    // Para o MVP: Vamos injetar a PRIMEIRA barbearia da lista no token do usuário.
    // (No futuro, se ele tiver várias, o frontend mandará qual ele escolheu acessar).
    const activeMembership =
      user.memberships.length > 0 ? user.memberships[0] : null;

    const payload = {
      sub: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin, // Agora o backend sabe que você é o mestre
      barbershopId: activeMembership?.barbershopId || null,
      role: activeMembership?.role || null, // ADMIN ou BARBER naquela unidade
      barberId: user.barberId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        // Retornamos a lista pro Frontend saber se precisa mostrar a tela de "Trocar de Barbearia" no futuro
        memberships: user.memberships,
      },
    };
  }
  // NOVA LÓGICA DE DEFINIÇÃO DE SENHA
  async setupPassword(token: string, newPassword: string) {
    // 1. Recalcula o hash do token da URL
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Busca o usuário pendente (Atenção: Os campos inviteToken e inviteExpires precisam existir no schema)
    // Usando findFirst apenas como demonstração, ajuste conforme seu schema atual
    const user = await this.prisma.user.findFirst({
      where: {
        inviteToken: tokenHash,
        inviteExpires: { gt: new Date() },
        status: 'PENDING',
      },
      include: { memberships: true },
    });

    if (!user) {
      throw new BadRequestException('Link de convite inválido ou expirado.');
    }

    // Como os campos ainda não existem no seu schema, deixarei a estrutura comentada
    // para não quebrar seu código atual.

    // 3. Faz o hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Salva a senha e ativa o usuário
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        inviteToken: null,
        inviteExpires: null,
      },
    });

    // 5. Opcional: Já loga o usuário automaticamente retornando o JWT
    // Você pode reutilizar a mesma lógica de payload do seu método "login" aqui.

    return { message: 'Senha cadastrada. Em breve esta rota retornará o JWT.' };
  }
}
