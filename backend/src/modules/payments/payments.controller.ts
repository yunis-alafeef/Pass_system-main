import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async processPayment(
    @Body() body: {
      bookingId: string;
      method: string;
      amount: number;
      currency: string;
    },
  ) {
    return this.paymentsService.processPayment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('booking/:bookingId')
  async getPaymentsByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentsByBooking(bookingId);
  }
}
