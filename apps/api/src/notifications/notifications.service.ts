import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type EmailNotification = {
  to: string;
  subject: string;
  text: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly transporter?: Transporter;
  private readonly from: string;

  constructor(
    @Optional() @InjectQueue('notifications') private readonly queue?: Queue,
  ) {
    this.from = process.env.EMAIL_FROM ?? 'NexaOps <no-reply@nexaops.local>';

    // Real SMTP transport when configured; console fallback otherwise so
    // local dev needs no mail server.
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      });
      this.logger.log(`SMTP transport configured (${process.env.SMTP_HOST})`);
    } else {
      this.logger.warn(
        'SMTP_HOST not set — emails will be logged to the console only',
      );
    }
  }

  async sendEmail(data: EmailNotification): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to: data.to,
          subject: data.subject,
          text: data.text,
        });
        this.logger.log(`Email sent to ${data.to}: ${data.subject}`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${data.to}: ${String(error)}`,
        );
        throw error; // let BullMQ retry the job
      }
      return;
    }

    this.logger.log(
      `📧 [Mock Email] To: ${data.to} | Subject: ${data.subject}`,
    );
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
