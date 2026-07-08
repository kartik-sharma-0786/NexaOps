import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class AssignIncidentDto {
  // null clears the assignment
  @ValidateIf((o) => o.assigneeId !== null)
  @IsUUID()
  @IsOptional()
  assigneeId: string | null;
}
