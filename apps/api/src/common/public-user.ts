/** Drizzle relation config: load user fields safe for API responses. */
export const publicUserColumns = {
  columns: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
  },
} as const;

/** Defense-in-depth: strip passwordHash if it ever slips through a query. */
export function stripPasswordHash<T extends { passwordHash?: string }>(
  user: T | null | undefined,
): Omit<T, 'passwordHash'> | undefined {
  if (!user) return undefined;

  const safe = { ...user } as T & { passwordHash?: string };
  delete safe.passwordHash;
  return safe as Omit<T, 'passwordHash'>;
}

export function stripPasswordHashFromIncident<T>(incident: T): T {
  if (!incident || typeof incident !== 'object') return incident;

  const value = incident as {
    creator?: { passwordHash?: string } | null;
    events?: Array<{ actor?: { passwordHash?: string } | null }>;
  };

  if (value.creator) {
    value.creator = stripPasswordHash(value.creator) as typeof value.creator;
  }
  if (value.events) {
    value.events = value.events.map((event) => ({
      ...event,
      actor: stripPasswordHash(event.actor) as (typeof event)['actor'],
    }));
  }

  return incident;
}
