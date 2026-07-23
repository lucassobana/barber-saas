import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreatePlatformDto {
  // Dados da Barbearia
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() slug!: string;
  @IsString() @IsNotEmpty() openTime!: string;
  @IsString() @IsNotEmpty() closeTime!: string;

  // Dados do Cliente (Dono da barbearia que vai acessar o sistema)
  @IsString() @IsNotEmpty() ownerName!: string;
  @IsEmail() @IsNotEmpty() ownerEmail!: string;
  @IsString() @IsNotEmpty() ownerPassword!: string;
}
