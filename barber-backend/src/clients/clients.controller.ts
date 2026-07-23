import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt')) // Usa o guard nativo do Passport/NestJS
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
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
  findAll(@CurrentUser() user: UserPayload) {
    return this.clientsService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.clientsService.findOne(
      id,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }
}
