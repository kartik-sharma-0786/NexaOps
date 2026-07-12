import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsUrl({ require_protocol: true, protocols: ['http', 'https'], require_tld: false })
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  intervalMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateMonitorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'], require_tld: false })
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  intervalMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
