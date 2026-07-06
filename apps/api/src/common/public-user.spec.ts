import {
  stripPasswordHash,
  stripPasswordHashFromIncident,
} from './public-user';

describe('public-user', () => {
  describe('stripPasswordHash', () => {
    it('removes passwordHash from user objects', () => {
      const user = {
        id: '1',
        email: 'a@b.com',
        name: 'Alice',
        passwordHash: 'secret-hash',
        createdAt: new Date(),
      };

      const safe = stripPasswordHash(user);

      expect(safe).toEqual({
        id: '1',
        email: 'a@b.com',
        name: 'Alice',
        createdAt: user.createdAt,
      });
      expect(safe).not.toHaveProperty('passwordHash');
    });

    it('returns undefined for null/undefined', () => {
      expect(stripPasswordHash(null)).toBeUndefined();
      expect(stripPasswordHash(undefined)).toBeUndefined();
    });
  });

  describe('stripPasswordHashFromIncident', () => {
    it('strips passwordHash from creator and event actors', () => {
      const incident = {
        id: 'inc-1',
        title: 'Outage',
        creator: {
          id: 'u1',
          email: 'a@b.com',
          name: 'Alice',
          passwordHash: 'hash-1',
        },
        events: [
          {
            id: 'e1',
            message: 'comment',
            actor: {
              id: 'u2',
              email: 'b@b.com',
              name: 'Bob',
              passwordHash: 'hash-2',
            },
          },
        ],
      };

      const safe = stripPasswordHashFromIncident(incident);

      expect(safe.creator).not.toHaveProperty('passwordHash');
      expect(safe.events?.[0]?.actor).not.toHaveProperty('passwordHash');
    });
  });
});
