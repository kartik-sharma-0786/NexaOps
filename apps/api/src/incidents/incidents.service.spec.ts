import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from '../events/events.gateway';
import { ChatopsService } from '../notifications/chatops.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IncidentsService } from './incidents.service';

jest.mock('@nexaops/database', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    query: {
      incidents: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
    transaction: jest.fn(),
  },
  incidents: {},
  incidentEvents: {},
  tenantMembers: {},
  users: {},
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { db } = require('@nexaops/database');

const mockedDb = db as {
  insert: jest.Mock;
  select: jest.Mock;
  transaction: jest.Mock;
  query: {
    incidents: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
  };
};

describe('IncidentsService', () => {
  let service: IncidentsService;
  const eventsGateway = {
    server: { to: jest.fn().mockReturnThis(), emit: jest.fn() },
  };
  const notificationsService = {
    enqueueEmail: jest.fn().mockResolvedValue(undefined),
  };
  const chatopsService = {
    notify: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: EventsGateway, useValue: eventsGateway },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: ChatopsService, useValue: chatopsService },
      ],
    }).compile();

    service = module.get(IncidentsService);
  });

  describe('findOne', () => {
    it('throws NotFoundException when incident is missing', async () => {
      mockedDb.query.incidents.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('missing', 'tenant-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('never returns passwordHash on creator or actors', async () => {
      mockedDb.query.incidents.findFirst.mockResolvedValue({
        id: 'inc-1',
        tenantId: 'tenant-1',
        title: 'Outage',
        creator: {
          id: 'u1',
          email: 'a@b.com',
          name: 'Alice',
          createdAt: new Date(),
        },
        events: [
          {
            id: 'e1',
            message: 'Update',
            actor: {
              id: 'u2',
              email: 'b@b.com',
              name: 'Bob',
              createdAt: new Date(),
            },
          },
        ],
      });

      const incident = await service.findOne('inc-1', 'tenant-1');

      expect(incident.creator).not.toHaveProperty('passwordHash');
      expect(incident.events?.[0]?.actor).not.toHaveProperty('passwordHash');
    });
  });

  describe('findAll', () => {
    it('returns paginated data and strips passwordHash', async () => {
      mockedDb.query.incidents.findMany.mockResolvedValue([
        {
          id: 'inc-1',
          creator: { id: 'u1', email: 'a@b.com', name: 'Alice' },
        },
      ]);
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 41 }]),
        }),
      });

      const result = await service.findAll('tenant-1', {
        page: 1,
        limit: 20,
      });

      expect(result.data[0].creator).not.toHaveProperty('passwordHash');
      expect(result.total).toBe(41);
      expect(result.page).toBe(1);
      expect(result.pageCount).toBe(3);
    });
  });
});
