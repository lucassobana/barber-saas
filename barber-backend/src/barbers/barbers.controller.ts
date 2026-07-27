import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body, // Mantenha o Body para o Patch
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BarbersService } from './barbers.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateBarberDto } from './dto/update-barber.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  // A rota @Post() foi removida daqui! Toda criação agora passa por /users/invite.

  @Get()
  @Roles('ADMIN', 'OWNER')
  findAll(@CurrentUser() user: UserPayload) {
    return this.barbersService.findAll(user.barbershopId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.barbersService.findOne(id, user.barbershopId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER')
  update(
    @Param('id') id: string,
    @Body() updateBarberDto: UpdateBarberDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.barbersService.update(id, updateBarberDto, user.barbershopId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.barbersService.remove(id, user.barbershopId);
  }
}
