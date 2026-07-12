import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpsertEscalationPolicyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  severity?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  delayMinutes?: number;

  @IsOptional()
  @IsIn(['OWNER', 'ADMIN', 'RESPONDER'])
  notifyRole?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
