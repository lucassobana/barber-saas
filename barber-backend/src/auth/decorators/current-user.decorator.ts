import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface UserPayload {
  userId: string;
  barbershopId: string;
  role: 'ADMIN' | 'BARBER';
  barberId: string | null;
}

// Estende a interface do Request do Express para incluir o user do Passport
interface RequestWithUser extends Request {
  user: UserPayload;
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    // Tipamos explicitamente o request
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
