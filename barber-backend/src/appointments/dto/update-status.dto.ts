import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['AGENDADO', 'CONCLUÍDO', 'NÃO COMPARECEU', 'CANCELADO'])
  status!: string;
}
