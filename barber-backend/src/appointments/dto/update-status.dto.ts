import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['AGENDADO', 'CONCLUIDO', 'NAO COMPARECEU', 'CANCELADO'])
  status!: string;
}
