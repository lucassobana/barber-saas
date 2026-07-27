import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Reutilizamos a interface de request para saber os dados do dono logado
interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    barbershopId: string;
    barberId?: string;
  };
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invite')
  @Roles('ADMIN', 'OWNER')
  async inviteUser(
    @Body() body: { email: string; name?: string }, // O '?' torna o name opcional
    @Req() req: AuthRequest,
  ) {
    // Se o frontend enviar o nome, usamos ele. Se não, pegamos a primeira parte do e-mail (ex: "lucasobana")
    const barberName = body.name || body.email.split('@')[0];

    return this.usersService.createInvitedUser(
      body.email,
      barberName,
      req.user.barbershopId,
    );
  }
}
