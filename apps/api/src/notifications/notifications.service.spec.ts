import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('sends email inline when queue is unavailable', async () => {
    const service = new NotificationsService(undefined);
    const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

    await service.enqueueEmail({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello',
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('user@example.com'),
    );
    logSpy.mockRestore();
  });

  it('enqueues job when queue is available', async () => {
    const queue = { add: jest.fn().mockResolvedValue(undefined) };
    const service = new NotificationsService(queue as never);

    await service.enqueueEmail({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello',
    });

    expect(queue.add).toHaveBeenCalledWith('send-email', {
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello',
    });
  });
});
