import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsNumber()
  @IsNotEmpty()
  duration!: number;

  @IsString()
  @IsOptional()
  barberId?: string; // Admin pode definir de quem é o serviço.

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
