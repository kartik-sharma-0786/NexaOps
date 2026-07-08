import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  db,
  invitations,
  tenantMembers,
  tenants,
  users,
} from '@nexaops/database';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import type { AssignableRole } from './dto/team.dto';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type Actor = {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getWebAppUrl(): string {
  return (
    process.env.WEB_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.CORS_ORIGINS?.split(',')[0]?.trim() ??
    'http://localhost:3000'
  );
}

@Injectable()
export class TeamService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---- Members ----

  async listMembers(tenantId: string) {
    return db
      .select({
        userId: tenantMembers.userId,
        role: tenantMembers.role,
        joinedAt: tenantMembers.joinedAt,
        name: users.name,
        email: users.email,
      })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(eq(tenantMembers.tenantId, tenantId));
  }

  async updateMemberRole(
    actor: Actor,
    targetUserId: string,
    role: AssignableRole,
  ) {
    if (actor.userId === targetUserId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    const target = await this.getMembership(actor.tenantId, targetUserId);

    // Only owners may touch the OWNER role in either direction.
    if (
      (target.role === 'OWNER' || role === 'OWNER') &&
      actor.role !== 'OWNER'
    ) {
      throw new ForbiddenException('Only an owner can change owner roles');
    }

    if (target.role === 'OWNER' && role !== 'OWNER') {
      await this.assertNotLastOwner(actor.tenantId, targetUserId);
    }

    await db
      .update(tenantMembers)
      .set({ role })
      .where(
        and(
          eq(tenantMembers.tenantId, actor.tenantId),
          eq(tenantMembers.userId, targetUserId),
        ),
      );

    return { message: 'Role updated' };
  }

  async removeMember(actor: Actor, targetUserId: string) {
    if (actor.userId === targetUserId) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    const target = await this.getMembership(actor.tenantId, targetUserId);

    if (target.role === 'OWNER') {
      if (actor.role !== 'OWNER') {
        throw new ForbiddenException('Only an owner can remove an owner');
      }
      await this.assertNotLastOwner(actor.tenantId, targetUserId);
    }

    await db
      .delete(tenantMembers)
      .where(
        and(
          eq(tenantMembers.tenantId, actor.tenantId),
          eq(tenantMembers.userId, targetUserId),
        ),
      );

    return { message: 'Member removed' };
  }

  // ---- Invitations ----

  async createInvitation(actor: Actor, email: string, role: AssignableRole) {
    if (role === 'OWNER' && actor.role !== 'OWNER') {
      throw new ForbiddenException('Only an owner can invite another owner');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (existingUser) {
      const [membership] = await db
        .select()
        .from(tenantMembers)
        .where(
          and(
            eq(tenantMembers.tenantId, actor.tenantId),
            eq(tenantMembers.userId, existingUser.id),
          ),
        );
      if (membership) {
        throw new ConflictException('That user is already a team member');
      }
    }

    const [pending] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.tenantId, actor.tenantId),
          eq(invitations.email, normalizedEmail),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date()),
        ),
      );
    if (pending) {
      throw new ConflictException(
        'There is already a pending invitation for that email',
      );
    }

    const token = randomBytes(32).toString('hex');
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, actor.tenantId));

    await db.insert(invitations).values({
      tenantId: actor.tenantId,
      email: normalizedEmail,
      role,
      tokenHash: hashToken(token),
      invitedById: actor.userId,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });

    const inviteUrl = `${getWebAppUrl()}/auth/accept-invite?token=${token}`;
    await this.notificationsService.enqueueEmail({
      to: normalizedEmail,
      subject: `You've been invited to ${tenant?.name ?? 'a team'} on NexaOps`,
      text:
        `${actor.email} invited you to join ${tenant?.name ?? 'their team'} ` +
        `on NexaOps as ${role}.\n\nAccept the invitation:\n${inviteUrl}\n\n` +
        `This link expires in 7 days. If you weren't expecting this, you can ignore it.`,
    });

    return { message: 'Invitation sent' };
  }

  async listInvitations(tenantId: string) {
    return db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        expiresAt: invitations.expiresAt,
        createdAt: invitations.createdAt,
      })
      .from(invitations)
      .where(
        and(
          eq(invitations.tenantId, tenantId),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date()),
        ),
      );
  }

  async revokeInvitation(tenantId: string, invitationId: string) {
    const [invite] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.tenantId, tenantId),
        ),
      );
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    await db.delete(invitations).where(eq(invitations.id, invitationId));
    return { message: 'Invitation revoked' };
  }

  // Public: lets the accept page show context before any credentials.
  async previewInvitation(token: string) {
    const invite = await this.getValidInvite(token);

    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, invite.tenantId));

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, invite.email));

    return {
      tenantName: tenant?.name ?? 'Unknown',
      email: invite.email,
      role: invite.role,
      userExists: !!existingUser,
    };
  }

  // Public: existing users confirm with their password; new users register.
  async acceptInvitation(token: string, password: string, name?: string) {
    const invite = await this.getValidInvite(token);

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, invite.email));

    if (user) {
      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) {
        throw new UnauthorizedException('Invalid password');
      }
    } else {
      if (!name) {
        throw new BadRequestException('Name is required to create an account');
      }
      const passwordHash = await argon2.hash(password);
      [user] = await db
        .insert(users)
        .values({ email: invite.email, name, passwordHash })
        .returning();
    }

    const [membership] = await db
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.tenantId, invite.tenantId),
          eq(tenantMembers.userId, user.id),
        ),
      );

    if (!membership) {
      await db.insert(tenantMembers).values({
        tenantId: invite.tenantId,
        userId: user.id,
        role: invite.role,
      });
    }

    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invite.id));

    const payload = {
      sub: user.id,
      email: user.email,
      role: invite.role,
      tenantId: invite.tenantId,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: invite.role,
        tenantId: invite.tenantId,
      },
    };
  }

  // ---- helpers ----

  private async getMembership(tenantId: string, userId: string) {
    const [membership] = await db
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          eq(tenantMembers.userId, userId),
        ),
      );
    if (!membership) {
      throw new NotFoundException('Member not found');
    }
    return membership;
  }

  private async assertNotLastOwner(tenantId: string, excludingUserId: string) {
    const owners = await db
      .select({ userId: tenantMembers.userId })
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          eq(tenantMembers.role, 'OWNER'),
        ),
      );
    const otherOwners = owners.filter((o) => o.userId !== excludingUserId);
    if (otherOwners.length === 0) {
      throw new BadRequestException(
        'A tenant must keep at least one owner. Promote someone else first.',
      );
    }
  }

  private async getValidInvite(token: string) {
    const [invite] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.tokenHash, hashToken(token)));

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invitation is invalid or has expired');
    }
    return invite;
  }
}
