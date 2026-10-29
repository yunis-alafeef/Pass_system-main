import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    tripId: string;
    seatNumbers: string[];
    passengers: Array<{
      fullName: string;
      identityNumber?: string;
      phone?: string;
      gender?: string;
      seatNumber: string;
    }>;
    currency?: string;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { seats: true },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    const seatsToBook = trip.seats.filter((s) => data.seatNumbers.includes(s.seatNumber));
    if (seatsToBook.length !== data.seatNumbers.length) {
      throw new BadRequestException('One or more selected seats do not exist');
    }

    // Verify seat availability or user hold
    for (const seat of seatsToBook) {
      if (seat.status === 'BOOKED') {
        throw new BadRequestException(`Seat ${seat.seatNumber} is already booked`);
      }
    }

    const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const totalYer = data.seatNumbers.length * trip.priceYer;
    const totalSar = trip.priceSar ? data.seatNumbers.length * trip.priceSar : totalYer / 400;

    // Create booking transaction
    const booking = await this.prisma.booking.create({
      data: {
        bookingCode,
        userId,
        tripId: data.tripId,
        totalYer,
        totalSar,
        paymentStatus: 'PENDING',
        status: 'CONFIRMED',
        passengers: {
          create: data.passengers.map((p) => {
            const matchedSeat = seatsToBook.find((s) => s.seatNumber === p.seatNumber) || seatsToBook[0];
            return {
              seatId: matchedSeat.id,
              fullName: p.fullName,
              identityNumber: p.identityNumber,
              phone: p.phone,
              gender: p.gender,
            };
          }),
        },
      },
      include: {
        passengers: { include: { seat: true } },
        trip: { include: { route: true, vendor: true } },
      },
    });

    // Mark seats as BOOKED
    await this.prisma.seat.updateMany({
      where: { id: { in: seatsToBook.map((s) => s.id) } },
      data: { status: 'BOOKED' },
    });

    return booking;
  }

  async findUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        trip: { include: { route: true, vendor: true } },
        passengers: { include: { seat: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        trip: { include: { route: true, vendor: true } },
        passengers: { include: { seat: true } },
        payments: { include: { transactions: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (role !== 'ADMIN' && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async cancelBooking(id: string, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        trip: true,
        passengers: { include: { seat: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (role !== 'ADMIN' && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Business Rules BR-BM-004 & BR-BM-005
    const departureTime = new Date(booking.trip.departureTime).getTime();
    const now = Date.now();
    const hoursRemaining = (departureTime - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let cancellationFee = 0;
    let refundAmount = 0;

    if (hoursRemaining > 24) {
      refundPercentage = 100;
      cancellationFee = 0;
      refundAmount = booking.totalYer;
    } else if (hoursRemaining > 0) {
      refundPercentage = 50;
      cancellationFee = booking.totalYer * 0.5;
      refundAmount = booking.totalYer * 0.5;
    } else {
      refundPercentage = 0;
      cancellationFee = booking.totalYer;
      refundAmount = 0;
    }

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: refundAmount > 0 ? 'REFUNDED' : 'CANCELLED',
      },
    });

    // Release seats
    const seatIds = booking.passengers.map((p) => p.seatId);
    if (seatIds.length > 0) {
      await this.prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'AVAILABLE' },
      });
    }

    return {
      booking: updatedBooking,
      cancellationFee,
      refundAmount,
      refundPercentage,
      message: hoursRemaining > 24
        ? 'تم الإلغاء بنجاح مع استرداد كامل المبلغ (أكثر من 24 ساعة قبل الرحلة)'
        : hoursRemaining > 0
        ? 'تم الإلغاء بنجاح مع استرداد 50% من المبلغ وفقاً للائحة الإلغاء'
        : 'تم الإلغاء دون استرداد لمرور موعد انطلاق الرحلة',
    };
  }
}
