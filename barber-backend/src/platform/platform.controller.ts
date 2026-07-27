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
import { PlatformService } from './platform.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { PlatformGuard } from './platform.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  // Rota de Provisionamento SaaS (Webhook / Master Key)
  @Post('barbershops')
  @UseGuards(PlatformGuard)
  createPlatform(@Body() createPlatformDto: CreatePlatformDto) {
    return this.platformService.createPlatform(createPlatformDto);
  }

  // --- O RESTANTE DO CRUD É RESTRITO APENAS AO ADMIN DO SISTEMA ---

  @Get('barbershops')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.platformService.findAll();
  }

  @Get('barbershops/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'OWNER')
  findOne(@Param('id') id: string) {
    return this.platformService.findOne(id);
  }

  @Patch('barbershops/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'OWNER')
  update(
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ) {
    return this.platformService.update(id, updatePlatformDto);
  }

  @Delete('barbershops/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'OWNER')
  remove(@Param('id') id: string) {
    return this.platformService.remove(id);
  }
}
