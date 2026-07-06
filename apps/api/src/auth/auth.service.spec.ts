import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

jest.mock('@nexaops/database', () => ({
  db: {
    select: jest.fn(),
    transaction: jest.fn(),
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
  },
  users: { email: 'email', id: 'id' },
  tenants: { slug: 'slug' },
  tenantMembers: {},
}));

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  verify: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { db } = require('@nexaops/database');

const mockedDb = db as {
  select: jest.Mock;
  transaction: jest.Mock;
  query: {
    users: {
      findFirst: jest.Mock;
    };
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-token'),
    } as unknown as JwtService;
    service = new AuthService(jwtService);
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'existing' }]),
        }),
      });

      await expect(
        service.register({
          tenantName: 'Acme',
          email: 'taken@example.com',
          name: 'Test',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('returns access token on successful registration', async () => {
      mockedDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      mockedDb.transaction.mockImplementation(
        async (fn: (tx: typeof db) => unknown) =>
          fn({
            insert: jest.fn().mockReturnValue({
              values: jest.fn().mockReturnValue({
                returning: jest
                  .fn()
                  .mockResolvedValueOnce([{ id: 'tenant-1', name: 'Acme' }])
                  .mockResolvedValueOnce([
                    {
                      id: 'user-1',
                      email: 'new@example.com',
                      name: 'New User',
                    },
                  ]),
              }),
            }),
          }),
      );

      const result = await service.register({
        tenantName: 'Acme Corp',
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      });

      expect(result.access_token).toBe('jwt-token');
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'new@example.com',
        role: 'OWNER',
        tenantId: 'tenant-1',
      });
      expect(argon2.hash).toHaveBeenCalledWith('password123');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockedDb.query.users.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException for invalid password', async () => {
      mockedDb.query.users.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        memberships: [{ role: 'OWNER', tenantId: 'tenant-1' }],
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns access token on valid credentials', async () => {
      mockedDb.query.users.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        memberships: [{ role: 'ADMIN', tenantId: 'tenant-1' }],
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.role).toBe('ADMIN');
    });
  });
});
