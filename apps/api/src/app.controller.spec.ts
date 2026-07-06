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
              message: 'Hello World! Database is connected.',
              tenants: [],
              databaseStatus: 'connected',
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return hello message with tenants', async () => {
      await expect(appController.getHello()).resolves.toEqual({
        message: 'Hello World! Database is connected.',
        tenants: [],
        databaseStatus: 'connected',
      });
    });
  });
});
