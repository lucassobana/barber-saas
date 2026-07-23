import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBarberDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsNotEmpty()
  openTime!: string;

  @IsString()
  @IsNotEmpty()
  closeTime!: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
