import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MarzbanService } from '../marzban/marzban.service';
import { PlansService } from '../plans/plans.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private marzban: MarzbanService,
    private plans: PlansService,
    private email: EmailService,
  ) {}

  async getMySubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) return null;

    const plan = this.plans.getById(sub.planId);
    const marzbanUser = await this.prisma.marzbanUser.findUnique({ where: { userId } });

    let usedTrafficBytes = 0;
    let dataLimitBytes = 0;

    if (marzbanUser) {
      try {
        const mu = await this.marzban.getUser(marzbanUser.username);
        if (mu) {
          usedTrafficBytes = mu.used_traffic;
          dataLimitBytes = mu.data_limit;
        }
      } catch {}
    }

    return {
      planId: sub.planId,
      planName: plan.name,
      status: sub.status,
      expiresAt: sub.expiresAt,
      usedTrafficBytes,
      dataLimitBytes,
      dataLimitGB: plan.dataLimitGB,
    };
  }

  async getMyConfig(userId: string) {
    const marzbanUser = await this.prisma.marzbanUser.findUnique({ where: { userId } });
    if (!marzbanUser) return { subscriptionUrl: null, nodes: [] };

    const mu = await this.marzban.getUser(marzbanUser.username);
    if (!mu) return { subscriptionUrl: null, nodes: [] };

    const nodes = await this.marzban.getNodes();

    return {
      subscriptionUrl: mu.subscription_url,
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        status: n.status,
      })),
    };
  }

  async activateOrExtend(userId: string, planId: string) {
    const plan = this.plans.getById(planId);
    const dataLimitBytes = this.plans.getDataLimitBytes(plan);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);
    const expireTimestamp = Math.floor(expiresAt.getTime() / 1000);

    let marzbanUser = await this.prisma.marzbanUser.findUnique({ where: { userId } });

    if (marzbanUser) {
      await this.marzban.updateUser(marzbanUser.username, dataLimitBytes, expireTimestamp);
    } else {
      const username = `vpn_${userId.replace(/-/g, '').substring(0, 12)}`;
      await this.marzban.createUser(username, dataLimitBytes, expireTimestamp);
      marzbanUser = await this.prisma.marzbanUser.create({
        data: { username, userId },
      });
    }

    await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, planId, status: 'active', expiresAt },
      update: { planId, status: 'active', expiresAt },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.email.sendSubscriptionConfirmed(user.email, plan.name[user.lang] || plan.name.ru, expiresAt, user.lang);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkExpirations() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringSoon = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        expiresAt: { lte: threeDaysFromNow, gt: new Date() },
      },
      include: { user: true },
    });

    for (const sub of expiringSoon) {
      await this.email.sendSubscriptionExpiringSoon(sub.user.email, sub.expiresAt, sub.user.lang);
    }

    const expired = await this.prisma.subscription.findMany({
      where: { status: 'active', expiresAt: { lte: new Date() } },
      include: { user: { include: { marzbanUser: true } } },
    });

    for (const sub of expired) {
      await this.prisma.subscription.update({ where: { id: sub.id }, data: { status: 'expired' } });
      if (sub.user.marzbanUser) {
        try { await this.marzban.disableUser(sub.user.marzbanUser.username); } catch {}
      }
    }
  }
}
