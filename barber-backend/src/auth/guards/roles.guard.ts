import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { UserPayload } from '../decorators/current-user.decorator';

interface RequestWithUser extends Request {
  user: UserPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // Tipamos a extração da requisição
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Convertendo a string para o Enum Role esperado pelo Prisma para evitar aviso de tipagem
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Acesso negado. Seu perfil não tem permissão para esta ação.',
      );
    }

    return true;
  }
}
