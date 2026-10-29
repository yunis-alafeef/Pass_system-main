import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async processPayment(data: {
    bookingId: string;
    method: string;
    amount: number;
    currency: string;
  }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const gatewayRef = `TX-${data.method.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Create payment record and completed transaction
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        method: data.method,
        amount: data.amount,
        currency: data.currency || 'YER',
        status: 'COMPLETED',
        gatewayRef,
        transactions: {
          create: {
            type: 'PAYMENT',
            amount: data.amount,
            status: 'SUCCESS',
          },
        },
      },
      include: {
        transactions: true,
      },
    });

    // Update booking payment status
    await this.prisma.booking.update({
      where: { id: data.bookingId },
      data: { paymentStatus: 'COMPLETED' },
    });

    return {
      payment,
      receiptNumber: gatewayRef,
      status: 'SUCCESS',
      message: 'Payment processed successfully',
    };
  }

  async processRefund(bookingId: string, amount: number) {
    const payment = await this.prisma.payment.findFirst({
      where: { bookingId },
    });

    if (!payment) throw new NotFoundException('Payment record not found for booking');

    const refundTransaction = await this.prisma.transaction.create({
      data: {
        paymentId: payment.id,
        type: 'REFUND',
        amount,
        status: 'SUCCESS',
      },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    return refundTransaction;
  }

  async getPaymentsByBooking(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      include: { transactions: true },
    });
  }
}
