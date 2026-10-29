import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: string; search?: string }) {
    const where: any = {};
    if (query?.status) {
      where.status = query.status.toUpperCase();
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.vendor.findMany({
      where,
      include: {
        contracts: { where: { isActive: true }, take: 1 },
        _count: { select: { trips: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        contracts: true,
        trips: {
          orderBy: { departureTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async findByUserId(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        contracts: { where: { isActive: true } },
        trips: {
          orderBy: { departureTime: 'desc' },
        },
      },
    });

    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async updateStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED') {
    return this.prisma.vendor.update({
      where: { id },
      data: { status },
    });
  }

  async updateCommission(id: string, commissionRate: number) {
    // Update or create active contract
    const existing = await this.prisma.vendorContract.findFirst({
      where: { vendorId: id, isActive: true },
    });

    if (existing) {
      return this.prisma.vendorContract.update({
        where: { id: existing.id },
        data: { commissionRate },
      });
    }

    return this.prisma.vendorContract.create({
      data: {
        vendorId: id,
        commissionRate,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }

  async getStats(userId: string) {
    const vendor = await this.findByUserId(userId);
    const trips = await this.prisma.trip.findMany({
      where: { vendorId: vendor.id },
      include: { bookings: true },
    });

    const activeTrips = trips.filter((t) => t.status === 'SCHEDULED' || t.status === 'BOARDING' || t.status === 'IN_TRANSIT').length;
    const completedTrips = trips.filter((t) => t.status === 'COMPLETED').length;

    let totalRevenue = 0;
    trips.forEach((t) => {
      t.bookings.forEach((b) => {
        if (b.status === 'CONFIRMED') {
          totalRevenue += b.totalYer;
        }
      });
    });

    const activeContract = vendor.contracts.find((c) => c.isActive);
    const commissionRate = activeContract?.commissionRate ?? 0.05;
    const netRevenue = totalRevenue * (1 - commissionRate);

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      rating: vendor.rating,
      totalTrips: trips.length,
      activeTrips,
      completedTrips,
      totalRevenue,
      netRevenue,
      commissionRate,
    };
  }
}
