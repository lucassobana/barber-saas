import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { PlatformGuard } from './platform.guard';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post('barbershops')
  @UseGuards(PlatformGuard) // Protege a rota com a Master Key
  createPlatform(@Body() createPlatformDto: CreatePlatformDto) {
    return this.platformService.createPlatform(createPlatformDto);
  }
}
