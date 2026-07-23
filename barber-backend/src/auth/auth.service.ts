import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
}
