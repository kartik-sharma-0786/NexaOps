import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateIntegrationsDto {
  // null/empty clears the webhook
  @ValidateIf((o) => o.slackWebhookUrl != null && o.slackWebhookUrl !== '')
  @IsString()
  @IsOptional()
  slackWebhookUrl?: string | null;

  @ValidateIf((o) => o.discordWebhookUrl != null && o.discordWebhookUrl !== '')
  @IsString()
  @IsOptional()
  discordWebhookUrl?: string | null;
}

export class CreateApiKeyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name?: string;
}

export class IngestAlertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
