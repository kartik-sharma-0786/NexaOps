import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateIncidentStatusDto {
  @IsEnum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED'])
  @IsNotEmpty()
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
}
