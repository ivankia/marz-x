import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
    this.from = config.get('RESEND_FROM') || 'noreply@example.com';
  }

  async sendVerification(to: string, verifyUrl: string, lang = 'ru') {
    const subjects = { ru: 'Подтвердите email', en: 'Verify your email' };
    const bodies = {
      ru: `<p>Нажмите на кнопку ниже, чтобы подтвердить ваш email:</p>
           <a href="${verifyUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Подтвердить email</a>
           <p>Ссылка действительна 24 часа.</p>`,
      en: `<p>Click the button below to verify your email:</p>
           <a href="${verifyUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Verify email</a>
           <p>Link is valid for 24 hours.</p>`,
    };

    await this.send(to, subjects[lang] || subjects.ru, this.wrap(bodies[lang] || bodies.ru));
  }

  async sendPasswordReset(to: string, resetUrl: string, lang = 'ru') {
    const subjects = { ru: 'Сброс пароля', en: 'Password reset' };
    const bodies = {
      ru: `<p>Вы запросили сброс пароля. Нажмите кнопку ниже:</p>
           <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Сбросить пароль</a>
           <p>Ссылка действительна 2 часа. Если вы не запрашивали сброс — проигнорируйте это письмо.</p>`,
      en: `<p>You requested a password reset. Click the button below:</p>
           <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset password</a>
           <p>Link is valid for 2 hours. If you didn't request this, ignore this email.</p>`,
    };

    await this.send(to, subjects[lang] || subjects.ru, this.wrap(bodies[lang] || bodies.ru));
  }

  async sendSubscriptionConfirmed(to: string, planName: string, expiresAt: Date, lang = 'ru') {
    const subjects = { ru: 'Подписка активирована', en: 'Subscription activated' };
    const expiry = expiresAt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');
    const bodies = {
      ru: `<p>Ваша подписка <strong>${planName}</strong> активирована.</p>
           <p>Действует до: <strong>${expiry}</strong></p>
           <p><a href="${this.config.get('APP_URL')}/dashboard">Войти в личный кабинет</a></p>`,
      en: `<p>Your <strong>${planName}</strong> subscription is now active.</p>
           <p>Valid until: <strong>${expiry}</strong></p>
           <p><a href="${this.config.get('APP_URL')}/dashboard">Go to dashboard</a></p>`,
    };

    await this.send(to, subjects[lang] || subjects.ru, this.wrap(bodies[lang] || bodies.ru));
  }

  async sendSubscriptionExpiringSoon(to: string, expiresAt: Date, lang = 'ru') {
    const subjects = { ru: 'Подписка истекает через 3 дня', en: 'Subscription expires in 3 days' };
    const expiry = expiresAt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');
    const bodies = {
      ru: `<p>Ваша VPN-подписка истекает <strong>${expiry}</strong>.</p>
           <p><a href="${this.config.get('APP_URL')}/dashboard">Продлить подписку</a></p>`,
      en: `<p>Your VPN subscription expires on <strong>${expiry}</strong>.</p>
           <p><a href="${this.config.get('APP_URL')}/dashboard">Renew subscription</a></p>`,
    };

    await this.send(to, subjects[lang] || subjects.ru, this.wrap(bodies[lang] || bodies.ru));
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  private wrap(body: string) {
    return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1f2937">${body}</body></html>`;
  }
}
