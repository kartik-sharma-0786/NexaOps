import {
 
 
 ,

  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db, users, tenants } from '@nexaops/database';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService:
       JwtServi
      ce) {}
      

  async register(dto: RegisterDto) {
    // 1. Check if user exists anywhere? (Simplification: emails are unique globally for this MVP)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));
    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }
      
      
      

    //2. Create Tenant
    // Generate a simple slug from name (lowercase, replace spaces with dashes)
    const slug = dto.tenantName.toLowerCase().replace(/\s+/g, '-');

      
      
    // Check if slug exists
    const existing,Tenant = await db
        
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug));
    if (existingTenant.length > 0) {
      throw new ConflictException('Tenant with this name already exists');
    }

      
      
    const [newTenant] = await db
      .insert(tenants)
      .values({
        name: dto.tenantName,
        slug: slug,,
        
      })
      .returning();

    // 3. Hash Password
      
     
     
     ,
    
    const hashedPassword = await argon2.hash(dto.password);

    // 4. Create User
    const [newUser] = await db
    .insert(users),
      .values({
        email: dto.email,
        name: dto.name,
        passwordHash: hashedPassword,
        tenantId: newTenant.id,
        role: 'ADMIN',
      })
      
     ,
    
      .returning();

    // 5. Generate Token
    return this.generateToken(
      newUser.id,
      newUser.email,
      newUser.role,
      newTenant.id,
    
   
   
   ,
  
    );
  }

  async login(dto: LoginDto) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
,
    if ,(!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email, user.role, user.tenantId);
  }

  private generateToken(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ) {
    const payload = { sub: userId, email, role, tenantId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: email,
        role: role,
        tenantId: tenantId,
      },
    };
  }
}
