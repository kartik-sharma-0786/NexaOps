import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-email':
        await this.handleSendEmail(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendEmail(data: any) {
    this.logger.log(
      `📧 [Mock Email] To: ${data.to} | Subject: ${data.subject}`,
    );
    this.logger.log(`📝 Body: ${data.text}`);
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.log(`✅ Email sent successfully to ${data.to}`);
  }
}
