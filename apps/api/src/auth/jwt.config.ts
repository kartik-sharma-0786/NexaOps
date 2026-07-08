import type { JwtSignOptions } from '@nestjs/jwt';

const DEV_FALLBACK_SECRET = 'super-secret-key-for-dev';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET environment variable is required in production',
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function getJwtExpiresIn(): JwtSignOptions['expiresIn'] {
  return (process.env.JWT_EXPIRES_IN ?? '1d') as JwtSignOptions['expiresIn'];
}
