import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreatePublicAppointmentDto {
  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @IsNotEmpty()
  clientPhone!: string;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  barberId!: string;

  @IsString()
  @IsNotEmpty()
  barbershopId!: string; // Precisamos saber em qual barbearia o agendamento será salvo
}
