import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db, tenantMembers, tenants, users } from '@nexaops/database';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

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
    const result = await db.transaction(async (tx) => {
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
    const membership = user.memberships[0];
    if (!membership) {
      throw new UnauthorizedException('No tenant found for this user');
    }

    return this.generateToken(
      user.id,
      user.email,
      membership.role,
      membership.tenantId,
    );
  }

  private async generateToken(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ) {
    const payload = { sub: userId, email, role, tenantId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: userId,
        email,
        role,
        tenantId,
      },
    };
  }
}
