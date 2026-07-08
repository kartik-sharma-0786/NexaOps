import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ASSIGNABLE_ROLES } from '../../auth/roles.constants';

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsIn(ASSIGNABLE_ROLES)
  role: AssignableRole;
}

export class UpdateMemberRoleDto {
  @IsIn(ASSIGNABLE_ROLES)
  role: AssignableRole;
}

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @MinLength(6)
  password: string;
}
