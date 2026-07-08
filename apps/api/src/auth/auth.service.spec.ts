import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from './auth.service';

jest.mock('@nexaops/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
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
  passwordResetTokens: {},
}));

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  verify: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { db } = require('@nexaops/database');

const mockedDb = db as {
  select: jest.Mock;
  insert: jest.Mock;
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
  let notifications: { enqueueEmail: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-token'),
    } as unknown as JwtService;
    notifications = { enqueueEmail: jest.fn().mockResolvedValue(undefined) };
    service = new AuthService(
      jwtService,
      notifications as unknown as NotificationsService,
    );
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

  describe('forgotPassword', () => {
    it('returns generic message and sends nothing for unknown email', async () => {
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.forgotPassword('missing@example.com');

      expect(result.message).toContain('If that email is registered');
      expect(notifications.enqueueEmail).not.toHaveBeenCalled();
    });

    it('stores a token and emails a reset link for known email', async () => {
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockResolvedValue([
              { id: 'user-1', email: 'user@example.com', name: 'User' },
            ]),
        }),
      });
      const values = jest.fn().mockResolvedValue(undefined);
      mockedDb.insert.mockReturnValue({ values });

      const result = await service.forgotPassword('user@example.com');

      expect(result.message).toContain('If that email is registered');
      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
      );
      expect(notifications.enqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          text: expect.stringContaining('/auth/reset-password?token='),
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('rejects unknown tokens', async () => {
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.resetPassword('bad-token', 'newpassword'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects expired tokens', async () => {
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: 'token-1',
              userId: 'user-1',
              usedAt: null,
              expiresAt: new Date(Date.now() - 1000),
            },
          ]),
        }),
      });

      await expect(
        service.resetPassword('expired-token', 'newpassword'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates the password and marks the token used for valid tokens', async () => {
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: 'token-1',
              userId: 'user-1',
              usedAt: null,
              expiresAt: new Date(Date.now() + 60_000),
            },
          ]),
        }),
      });
      const txUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });
      mockedDb.transaction.mockImplementation(
        async (fn: (tx: typeof db) => unknown) => fn({ update: txUpdate }),
      );

      const result = await service.resetPassword('good-token', 'newpassword');

      expect(result.message).toContain('Password updated');
      expect(argon2.hash).toHaveBeenCalledWith('newpassword');
      expect(txUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
