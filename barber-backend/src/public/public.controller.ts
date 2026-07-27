import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreatePublicAppointmentDto } from './dto/create-public.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // GET http://localhost:3000/public/barbershops/barbearia-centro
  @Get('barbershops/:slug')
  getBarbershop(@Param('slug') slug: string) {
    return this.publicService.getBarbershopBySlug(slug);
  }

  @Get('availability')
  getAvailability(
    @Query('barberId') barberId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.publicService.getAvailableTimes(barberId, date, serviceId);
  }

  // POST http://localhost:3000/public/appointments
  @Post('appointments')
  createAppointment(
    @Body() createPublicAppointmentDto: CreatePublicAppointmentDto,
  ) {
    return this.publicService.createAppointment(createPublicAppointmentDto);
  }
}
