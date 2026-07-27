import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER', 'BARBER')
  create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.clientsService.create(
      createClientDto,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get()
  @Roles('ADMIN', 'OWNER', 'BARBER')
  findAll(@CurrentUser() user: UserPayload) {
    return this.clientsService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'BARBER')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.clientsService.findOne(
      id,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER', 'BARBER')
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.clientsService.update(
      id,
      updateClientDto,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER', 'BARBER')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.clientsService.remove(
      id,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }
}
