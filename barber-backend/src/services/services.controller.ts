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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles('ADMIN', 'OWNER', 'BARBER')
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
  @Roles('ADMIN', 'OWNER', 'BARBER')
  findAll(@CurrentUser() user: UserPayload) {
    return this.servicesService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'BARBER')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.servicesService.findOne(
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
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.servicesService.update(
      id,
      updateServiceDto,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER', 'BARBER')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.servicesService.remove(
      id,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }
}
