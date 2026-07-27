import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER', 'BARBER')
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
  @Roles('ADMIN', 'OWNER', 'BARBER')
  findAll(
    @CurrentUser() user: UserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.findAll(
      user.barbershopId,
      user.role,
      user.barberId,
      startDate,
      endDate,
    );
  }

  // Nova rota para buscar os agendamentos do dia
  @Get('today')
  @Roles('ADMIN', 'OWNER', 'BARBER')
  getToday(@CurrentUser() user: UserPayload) {
    return this.appointmentsService.getTodayAppointments(
      user.barbershopId,
      user.role,
      user.barberId,
    );
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'OWNER', 'BARBER')
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

  @Get('week')
  async getWeeklyAppointments(@Req() req: AuthRequest) {
    // 2. Trocamos o 'any' por 'AuthRequest'
    const barbershopId = req.user.barbershopId;
    const barberId = req.user.role === 'BARBER' ? req.user.barberId : undefined;

    return this.appointmentsService.getWeeklyAppointments(
      barbershopId,
      barberId,
    );
  }

  @Get('month')
  async getMonthlyAppointments(@Req() req: AuthRequest) {
    // 3. Trocamos o 'any' por 'AuthRequest'
    const barbershopId = req.user.barbershopId;
    const barberId = req.user.role === 'BARBER' ? req.user.barberId : undefined;

    return this.appointmentsService.getMonthlyAppointments(
      barbershopId,
      barberId,
    );
  }
}
