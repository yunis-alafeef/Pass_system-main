import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import Redis from 'ioredis';
import { SeatsGateway } from './seats.gateway';

@Injectable()
export class SeatsService {
  private redisClient: Redis;

  constructor(
    private prisma: PrismaService,
    private seatsGateway: SeatsGateway,
  ) {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redisClient.on('error', (err) => console.error('Redis connection error:', err));
  }

  async getSeatLayout(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    const seats = await this.prisma.seat.findMany({
      where: { tripId },
      include: {
        holds: {
          where: { expiresAt: { gt: new Date() }, status: 'ACTIVE' },
        },
      },
    });

    const layout = await this.prisma.seatLayout.findFirst({
      where: { busType: trip.busType },
    });

    return { layout, seats };
  }

  async holdSeat(tripId: string, seatId: string, userId: string) {
    const seat = await this.prisma.seat.findUnique({
      where: { id: seatId },
      include: { holds: { where: { status: 'ACTIVE', expiresAt: { gt: new Date() } } } },
    });

    if (!seat || seat.tripId !== tripId) {
      throw new NotFoundException('Seat not found');
    }

    if (seat.status !== 'AVAILABLE') {
      throw new BadRequestException(`Seat is already ${seat.status}`);
    }

    if (seat.holds.length > 0) {
      throw new BadRequestException('Seat is already held by someone else');
    }

    // Redis distributed lock
    const lockKey = `seat_lock:${tripId}:${seatId}`;
    const result = await this.redisClient.set(lockKey, userId, 'EX', 900, 'NX');

    if (!result) {
      throw new BadRequestException('Seat is already held by someone else');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const hold = await this.prisma.seatHold.create({
      data: {
        seatId,
        userId,
        expiresAt,
        status: 'ACTIVE',
      },
    });

    await this.prisma.seat.update({
      where: { id: seatId },
      data: { status: 'HELD' },
    });

    this.seatsGateway.broadcastSeatUpdate(tripId, seatId, 'HELD');

    return hold;
  }

  async releaseSeat(tripId: string, seatId: string, userId: string) {
    const hold = await this.prisma.seatHold.findFirst({
      where: { seatId, userId, status: 'ACTIVE' },
    });

    if (hold) {
      await this.prisma.seatHold.update({
        where: { id: hold.id },
        data: { status: 'EXPIRED' },
      });
    }

    await this.prisma.seat.update({
      where: { id: seatId },
      data: { status: 'AVAILABLE' },
    });

    const lockKey = `seat_lock:${tripId}:${seatId}`;
    const heldBy = await this.redisClient.get(lockKey);
    if (heldBy === userId) {
      await this.redisClient.del(lockKey);
    }

    this.seatsGateway.broadcastSeatUpdate(tripId, seatId, 'AVAILABLE');

    return { message: 'Seat released' };
  }
}
