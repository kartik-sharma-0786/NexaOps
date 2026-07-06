import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Queue } from 'bullmq';

export type EmailNotification = {
  to: string;
  subject: string;
  text: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Optional() @InjectQueue('notifications') private readonly queue?: Queue,
  ) {}

  async sendEmail(data: EmailNotification): Promise<void> {
    this.logger.log(
      `📧 [Mock Email] To: ${data.to} | Subject: ${data.subject}`,
    );
    this.logger.log(`📝 Body: ${data.text}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.log(`✅ Email sent successfully to ${data.to}`);
  }

  async enqueueEmail(data: EmailNotification): Promise<void> {
    if (this.queue) {
      await this.queue.add('send-email', data);
      return;
    }
    await this.sendEmail(data);
  }
}
