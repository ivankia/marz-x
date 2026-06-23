import { Controller, Post, Get, Body, Req, Headers, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.payments.createPayment(req.user.id, dto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  history(@Req() req: any) {
    return this.payments.getHistory(req.user.id);
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.payments.handleWebhook(body, headers);
  }
}
