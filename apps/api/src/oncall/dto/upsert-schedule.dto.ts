import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertScheduleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberOrder?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  shiftDays?: number;

  @IsOptional()
  @IsString()
  startDate?: string;
}
