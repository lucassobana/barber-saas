import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  barbershopId: string;
  role: 'ADMIN' | 'BARBER';
  barberId: string | null;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      barbershopId: payload.barbershopId,
      role: payload.role,
      barberId: payload.barberId,
    };
  }
}
