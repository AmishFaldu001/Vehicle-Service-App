import * as mailChimp from '@mailchimp/mailchimp_transactional';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import dayjs from 'dayjs';
import { applicationConfig } from '../config/application.config';
import { CancelScheduledMailDto } from './dtos/response/cancel-scheduled-mail.response.dto';
import { SendScheduledMailDto } from './dtos/response/send-scheduled-mail.response.dto';

@Injectable()
export class EmailService {
  private mailchimpClient: mailChimp.ApiClient;

  constructor(
    @Inject(applicationConfig.KEY)
    private appConfig: ConfigType<typeof applicationConfig>,
  ) {
    this.mailchimpClient = mailChimp(this.appConfig.mail.apiKey);
  }

  async sendMail(
    toEmail: string,
    emailSubject: string,
    emailContent: string,
    sendMailAt: dayjs.Dayjs = undefined,
  ): Promise<SendScheduledMailDto> {
    try {
      const mailBody: mailChimp.MessagesSendRequest = {
        async: true,
        send_at: sendMailAt?.toISOString(),
        message: {
          from_email: this.appConfig.mail.fromEmail,
          to: [{ email: toEmail }],
          subject: emailSubject,
          text: emailContent,
        },
      };
      const sendMailResponse: any = await this.mailchimpClient.messages.send(
        mailBody,
      );

      if (sendMailResponse?.isAxiosError) {
        const message =
          sendMailResponse?.response?.data || sendMailResponse?.message;
        throw new Error(JSON.stringify(message));
      }

      if (sendMailResponse[0].status === 'invalid') {
        throw new Error(
          `email.service : sendMail : Invalid recipient status received : mail id = ${sendMailResponse[0]._id} : reject reason = ${sendMailResponse[0].reject_reason} : recipient email = ${sendMailResponse[0].email}`,
        );
      } else if (sendMailResponse[0].status === 'rejected') {
        throw new Error(
          `email.service : sendMail : Rejected recipient status received : mail id = ${sendMailResponse[0]._id} : reject reason = ${sendMailResponse[0].reject_reason} : recipient email = ${sendMailResponse[0].email}`,
        );
      }
      return { status: 'Success', mailId: sendMailResponse[0]._id };
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

  async cancelScheduleMail(
    appointmentId: string,
    toEmail: string,
  ): Promise<CancelScheduledMailDto> {
    try {
      const scheduledMails = (await this.mailchimpClient.messages.listScheduled(
        {
          to: toEmail,
        },
      )) as mailChimp.MessagesScheduledMessageResponse[];

      const promiseArray = [];
      scheduledMails.forEach((mail) => {
        if (mail.subject.includes(appointmentId)) {
          promiseArray.push(
            this.mailchimpClient.messages.cancelScheduled({
              id: mail._id,
            }),
          );
        }
      });
      await Promise.all(promiseArray);
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
