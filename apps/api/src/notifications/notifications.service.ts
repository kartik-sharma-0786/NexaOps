import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Resend } from 'resend';
import { Queue } from 'bullmq';

export type EmailNotification = {
  to: string;
  subject: string;
  text: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resend?: Resend;
  private readonly from: string;

  constructor(
    @Optional() @InjectQueue('notifications') private readonly queue?: Queue,
  ) {
    this.from = process.env.EMAIL_FROM ?? 'NexaOps <onboarding@resend.dev>';

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email transport configured');
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set — emails will be logged to the console only',
      );
    }
  }

  async sendEmail(data: EmailNotification): Promise<void> {
    if (this.resend) {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: data.to,
        subject: data.subject,
        text: data.text,
      });
      if (error) {
        this.logger.error(`Failed to send email to ${data.to}: ${JSON.stringify(error)}`);
        throw new Error(error.message);
      }
      this.logger.log(`Email sent to ${data.to}: ${data.subject}`);
      return;
    }

    this.logger.log(`📧 [Mock Email] To: ${data.to} | Subject: ${data.subject}`);
    this.logger.log(`📝 Body: ${data.text}`);
  }

  async enqueueEmail(data: EmailNotification): Promise<void> {
    if (this.queue) {
      await this.queue.add('send-email', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: true,
      });
      return;
    }
    await this.sendEmail(data);
  }
}
