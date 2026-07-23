import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BarbersService } from './barbers.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  @Post()
  @Roles(Role.ADMIN) // <- Apenas Administradores podem executar esta rota!
  create(
    @Body() createBarberDto: CreateBarberDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.barbersService.create(createBarberDto, user.barbershopId);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.barbersService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.barbersService.findOne(
      id,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }
}
