import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockResolvedValue({
              service: 'NexaOps API',
              databaseStatus: 'connected',
              message: 'NexaOps API is running. See /api/docs for documentation.',
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return service status without exposing data', async () => {
      const result = await appController.getHello();
      expect(result.databaseStatus).toBe('connected');
      expect(result).not.toHaveProperty('tenants');
    });
  });
});
