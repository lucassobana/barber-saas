import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicAppointmentDto } from './create-public.dto';

export class UpdatePublicDto extends PartialType(CreatePublicAppointmentDto) {}
