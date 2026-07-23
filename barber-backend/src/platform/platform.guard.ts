import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express'; // Importamos o tipo Request do Express

@Injectable()
export class PlatformGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Tipamos o request para evitar o "any"
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-platform-key'];

    // Em produção, isso deve vir do seu process.env.PLATFORM_KEY
    const masterKey = process.env.PLATFORM_KEY || 'SAAS_MASTER_KEY_123';

    if (apiKey !== masterKey) {
      throw new UnauthorizedException(
        'Acesso negado. Apenas o dono da plataforma pode executar esta ação.',
      );
    }
    return true;
  }
}
