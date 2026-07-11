import { IsDateString, IsUUID } from 'class-validator';

export class CreateOverrideDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;
}
