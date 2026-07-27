import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsArray,
} from 'class-validator';

export class UpdateBarberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  openTime?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  openDays?: string[];

  @IsString()
  @IsOptional()
  closeTime?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
