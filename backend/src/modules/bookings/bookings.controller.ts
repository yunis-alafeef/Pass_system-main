import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() data: any) {
    return this.bookingsService.create(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyBookings(@Request() req: any) {
    return this.bookingsService.findUserBookings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.findOne(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelBooking(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.cancelBooking(id, req.user.id, req.user.role);
  }
}
