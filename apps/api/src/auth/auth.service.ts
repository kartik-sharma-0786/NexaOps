import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  db,
  passwordResetTokens,
  tenantMembers,
  tenants,
  users,
} from '@nexaops/database';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function getWebAppUrl(): string {
  return (
    process.env.WEB_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.CORS_ORIGINS?.split(',')[0]?.trim() ??
    'http://localhost:3000'
  );
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if user exists anywhere?
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));
    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create Tenant
    // Generate a simple slug from name (lowercase, replace spaces with dashes)
    const slug = dto.tenantName.toLowerCase().replace(/\s+/g, '-');

    // Check if slug exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug));
    if (existingTenant.length > 0) {
      throw new ConflictException('Tenant with this name already exists');
    }

    // Transaction to ensure atomicity
    const result = await db.transaction(async (tx: typeof db) => {
      const [newTenant] = await tx
        .insert(tenants)
        .values({
          name: dto.tenantName,
          slug: slug,
        })
        .returning();

      const hashedPassword = await argon2.hash(dto.password);

      const [newUser] = await tx
        .insert(users)
        .values({
          email: dto.email,
          name: dto.name,
          passwordHash: hashedPassword,
        })
        .returning();

      await tx.insert(tenantMembers).values({
        tenantId: newTenant.id,
        userId: newUser.id,
        role: 'OWNER',
      });

      return { newTenant, newUser };
    });

    // 5. Generate Token
    return this.generateToken(
      result.newUser.id,
      result.newUser.email,
      'OWNER',
      result.newTenant.id,
      result.newUser.name,
      result.newTenant.name,
    );
  }

  async login(dto: LoginDto) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
      with: {
        memberships: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Default to the first tenant found
    const memberships = (
      user as {
        memberships?: Array<{ role: string; tenantId: string }>;
      }
    ).memberships;
    const membership = memberships?.[0];
    if (!membership) {
      throw new UnauthorizedException('No tenant found for this user');
    }

    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, membership.tenantId));

    return this.generateToken(
      user.id,
      user.email,
      membership.role,
      membership.tenantId,
      user.name,
      tenant?.name,
    );
  }

  async forgotPassword(email: string) {
    // Identical response whether or not the account exists, so the endpoint
    // cannot be used to probe for registered emails.
    const response = {
      message: 'If that email is registered, a reset link has been sent.',
    };

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return response;

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${getWebAppUrl()}/auth/reset-password?token=${token}`;
    await this.notificationsService.enqueueEmail({
      to: user.email,
      subject: 'Reset your NexaOps password',
      text:
        `Hi ${user.name},\n\n` +
        `We received a request to reset your NexaOps password. ` +
        `Open the link below to choose a new one (valid for 1 hour):\n\n` +
        `${resetUrl}\n\n` +
        `If you didn't request this, you can safely ignore this email.`,
    });

    return response;
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash));

    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const passwordHash = await argon2.hash(password);
    await db.transaction(async (tx: typeof db) => {
      await tx
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, row.userId));
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, row.id));
    });

    return { message: 'Password updated. You can now sign in.' };
  }

  async listMemberships(userId: string) {
    const rows = await db
      .select({
        tenantId: tenantMembers.tenantId,
        role: tenantMembers.role,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
      })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
      .where(eq(tenantMembers.userId, userId));
    return rows;
  }

  async switchTenant(userId: string, email: string, tenantId: string) {
    const [membership] = await db
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.userId, userId),
          eq(tenantMembers.tenantId, tenantId),
        ),
      );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this tenant');
    }

    const [row] = await db
      .select({ userName: users.name, tenantName: tenants.name })
      .from(users)
      .innerJoin(tenants, eq(tenants.id, tenantId))
      .where(eq(users.id, userId));

    return this.generateToken(
      userId,
      email,
      membership.role,
      tenantId,
      row?.userName,
      row?.tenantName,
    );
  }

  private async generateToken(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
    name?: string,
    tenantName?: string,
  ) {
    const payload = { sub: userId, email, role, tenantId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: userId,
        email,
        role,
        tenantId,
        name: name ?? null,
        tenantName: tenantName ?? null,
      },
    };
  }
}
