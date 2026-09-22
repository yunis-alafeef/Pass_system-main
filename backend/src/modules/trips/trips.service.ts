import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { origin, destination, date, type, sort, order } = query;

    const where: any = {};

    if (origin || destination || type) {
      where.route = {};
      if (origin) where.route.origin = { contains: origin, mode: 'insensitive' };
      if (destination) where.route.destination = { contains: destination, mode: 'insensitive' };
      if (type) where.route.type = type.toUpperCase();
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.departureTime = { gte: startOfDay, lte: endOfDay };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price') {
      orderBy = { priceYer: order === 'desc' ? 'desc' : 'asc' };
    } else if (sort === 'time') {
      orderBy = { departureTime: order === 'desc' ? 'desc' : 'asc' };
    }

    return this.prisma.trip.findMany({
      where,
      orderBy,
      include: {
        vendor: { select: { id: true, name: true, rating: true, city: true } },
        route: true,
      },
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, name: true, rating: true } },
        route: true,
        seats: true,
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async create(userId: string, data: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('User is not a vendor');

    return this.prisma.trip.create({
      data: {
        ...data,
        vendorId: vendor.id,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const trip = await this.prisma.trip.findUnique({ where: { id } });

    if (!trip) throw new NotFoundException('Trip not found');
    if (!vendor || trip.vendorId !== vendor.id) {
      throw new ForbiddenException('You can only update your own trips');
    }

    return this.prisma.trip.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const trip = await this.prisma.trip.findUnique({ where: { id } });

    if (!trip) throw new NotFoundException('Trip not found');
    if (!vendor || trip.vendorId !== vendor.id) {
      throw new ForbiddenException('You can only delete your own trips');
    }

    await this.prisma.trip.delete({ where: { id } });
    return { message: 'Trip deleted successfully' };
  }

  async updateStatus(id: string, userId: string, status: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const trip = await this.prisma.trip.findUnique({ where: { id } });

    if (!trip) throw new NotFoundException('Trip not found');
    if (!vendor || trip.vendorId !== vendor.id) {
      throw new ForbiddenException('You can only update status of your own trips');
    }

    return this.prisma.trip.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
