import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('onboarding')
  async createTenant(
    @Body()
    body: {
      barbershopName: string;
      ownerName: string;
      ownerEmail: string;
      openTime: string;
      closeTime: string;
      isBarber: boolean;
    },
  ) {
    return this.adminService.createTenant(body);
  }
}
