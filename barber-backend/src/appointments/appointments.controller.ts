import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.appointmentsService.create(
      createAppointmentDto,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.appointmentsService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      updateStatusDto,
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }
}
