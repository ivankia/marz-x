import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptions: SubscriptionsService) {}

  @Get('me')
  getMy(@Req() req: any) {
    return this.subscriptions.getMySubscription(req.user.id);
  }

  @Get('me/config')
  getConfig(@Req() req: any) {
    return this.subscriptions.getMyConfig(req.user.id);
  }
}
