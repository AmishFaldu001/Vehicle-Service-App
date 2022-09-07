import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as sgClient from '@sendgrid/client';
import { ClientRequest } from '@sendgrid/client/src/request';
import * as sgMail from '@sendgrid/mail';
import dayjs from 'dayjs';
import { applicationConfig } from '../config/application.config';
import { CancelScheduledMailDto } from './dtos/response/cancel-scheduled-mail.response.dto';
import { SendScheduledMailDto } from './dtos/response/send-scheduled-mail.response.dto';

@Injectable()
export class EmailService {
  private mailClient: sgMail.MailService = sgMail;

  constructor(
    @Inject(applicationConfig.KEY)
    private appConfig: ConfigType<typeof applicationConfig>,
  ) {
    this.mailClient.setApiKey(this.appConfig.mail.apiKey);
  }

  async generateBatchId(): Promise<string> {
    const request: ClientRequest = {
      url: `/v3/mail/batch`,
      method: 'POST',
    };

    try {
      const [response] = await sgClient.request(request);
      return (response.body as any).batch_id;
    } catch (error) {
      Logger.error(
        `email.service : generateBatchId : Something went wrong while creating sendgrid batch id : ${error}`,
      );
    }
    return null;
  }

  async sendMail(
    toEmail: string,
    emailSubject: string,
    emailContent: string,
    sendMailAt: dayjs.Dayjs = undefined,
  ): Promise<SendScheduledMailDto> {
    try {
      let batchId = undefined;
      if (sendMailAt) {
        batchId = await this.generateBatchId();
        if (!batchId) {
          throw new Error('email.service : sendMail : No batch id generated');
        }
      }

      const mailBody: sgMail.MailDataRequired = {
        to: { email: toEmail },
        from: { email: this.appConfig.mail.fromEmail },
        subject: emailSubject,
        text: emailContent,
        sendAt: sendMailAt?.unix(),
        batchId,
      };
      const [sendMailResponse] = await this.mailClient.send(mailBody);

      if (sendMailResponse.statusCode >= 400) {
        throw new Error(
          `email.service : sendMail : error while sending mail ${sendMailResponse}`,
        );
      }
      return { status: 'Success', mailId: batchId };
    } catch (error) {
      Logger.error(
        `email.service : scheduledMailSend : Something went wrong while sending mail : ${error}`,
      );
    }
    return {
      status: 'Failed',
      mailId: null,
    };
  }

  async cancelScheduleMail(batchId: string): Promise<CancelScheduledMailDto> {
    try {
      const data = {
        batch_id: batchId,
        status: 'cancel',
      };

      const request: ClientRequest = {
        url: `/v3/user/scheduled_sends`,
        method: 'POST',
        body: data,
      };

      await sgClient.request(request);
      return { status: 'Success' };
    } catch (error) {
      Logger.error(
        'email.service : cancelSchedulerMail : Something went wrong while cancelling scheduled mail',
        error,
      );
    }
    return { status: 'Failed' };
  }
}
