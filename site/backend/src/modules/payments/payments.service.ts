import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

const PLATEGA_API = 'https://app.platega.io';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private plans: PlansService,
    private subscriptions: SubscriptionsService,
    private config: ConfigService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const plan = this.plans.getById(dto.planId);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId: dto.planId,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod: dto.paymentMethod,
        status: 'pending',
      },
    });

    const appUrl = this.config.get('APP_URL');
    const res = await axios.post(
      `${PLATEGA_API}/transaction/process`,
      {
        paymentMethod: dto.paymentMethod,
        paymentDetails: { amount: plan.price, currency: plan.currency },
        description: `VPN ${plan.name.ru} — 30 дней`,
        return: `${appUrl}/dashboard?payment=success`,
        failedUrl: `${appUrl}/dashboard?payment=failed`,
        payload: payment.id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-MerchantId': this.config.get('PLATEGA_MERCHANT_ID'),
          'X-Secret': this.config.get('PLATEGA_SECRET'),
        },
        timeout: 15000,
      },
    );

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { plategaId: res.data.transactionId },
    });

    return { paymentId: payment.id, redirectUrl: res.data.redirect };
  }

  async handleWebhook(body: any, headers: Record<string, string>) {
    const merchantId = headers['x-merchantid'] || headers['x-MerchantId'];
    const secret = headers['x-secret'] || headers['x-Secret'];

    if (
      merchantId !== this.config.get('PLATEGA_MERCHANT_ID') ||
      secret !== this.config.get('PLATEGA_SECRET')
    ) {
      throw new UnauthorizedException('Invalid webhook credentials');
    }

    const { payload: paymentId, status } = body;
    if (!paymentId || !status) throw new BadRequestException('Missing payload or status');

    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return { ok: true };

    if (payment.status === 'confirmed') return { ok: true }; // idempotent

    await this.prisma.payment.update({ where: { id: paymentId }, data: { status: status.toLowerCase() } });

    if (status === 'CONFIRMED') {
      try {
        await this.subscriptions.activateOrExtend(payment.userId, payment.planId);
      } catch (err) {
        this.logger.error(`Failed to activate subscription for payment ${paymentId}: ${err.message}`);
      }
    }

    return { ok: true };
  }

  async getHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        planId: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
