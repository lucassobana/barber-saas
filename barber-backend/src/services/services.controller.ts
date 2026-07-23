import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.servicesService.create(
      createServiceDto,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.servicesService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.servicesService.findOne(
      id,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }
}
