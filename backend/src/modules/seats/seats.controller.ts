import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('trip/:tripId')
  async getSeatLayout(@Param('tripId') tripId: string) {
    return this.seatsService.getSeatLayout(tripId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hold')
  async holdSeat(
    @Request() req: any,
    @Body() body: { tripId: string; seatId: string },
  ) {
    return this.seatsService.holdSeat(body.tripId, body.seatId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('release')
  async releaseSeat(
    @Request() req: any,
    @Body() body: { tripId: string; seatId: string },
  ) {
    return this.seatsService.releaseSeat(body.tripId, body.seatId, req.user.id);
  }
}
