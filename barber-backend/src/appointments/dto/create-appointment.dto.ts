import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @IsNotEmpty()
  clientPhone!: string; // Usaremos o campo phone para o WhatsApp

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsOptional()
  barberId?: string;
}
