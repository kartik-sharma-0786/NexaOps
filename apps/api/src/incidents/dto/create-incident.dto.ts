import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
