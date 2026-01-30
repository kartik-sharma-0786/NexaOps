"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_1 = require("@nexaops/database");
const argon2 = __importStar(require("argon2"));
const drizzle_orm_1 = require("drizzle-orm");
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.email, dto.email));
        if (existingUser.length > 0) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const slug = dto.tenantName.toLowerCase().replace(/\s+/g, '-');
        const existingTenant = await database_1.db
            .select()
            .from(database_1.tenants)
            .where((0, drizzle_orm_1.eq)(database_1.tenants.slug, slug));
        if (existingTenant.length > 0) {
            throw new common_1.ConflictException('Tenant with this name already exists');
        }
        const result = await database_1.db.transaction(async (tx) => {
            const [newTenant] = await tx
                .insert(database_1.tenants)
                .values({
                name: dto.tenantName,
                slug: slug,
            })
                .returning();
            const hashedPassword = await argon2.hash(dto.password);
            const [newUser] = await tx
                .insert(database_1.users)
                .values({
                email: dto.email,
                name: dto.name,
                passwordHash: hashedPassword,
            })
                .returning();
            await tx.insert(database_1.tenantMembers).values({
                tenantId: newTenant.id,
                userId: newUser.id,
                role: 'OWNER',
            });
            return { newTenant, newUser };
        });
        return this.generateToken(result.newUser.id, result.newUser.email, 'OWNER', result.newTenant.id);
    }
    async login(dto) {
        const user = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.users.email, dto.email),
            with: {
                memberships: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const membership = user.memberships[0];
        if (!membership) {
            throw new common_1.UnauthorizedException('No tenant found for this user');
        }
        return this.generateToken(user.id, user.email, membership.role, membership.tenantId);
    }
    async generateToken(userId, email, role, tenantId) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map