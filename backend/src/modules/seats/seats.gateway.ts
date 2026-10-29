import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SeatsGateway {
  private readonly logger = new Logger(SeatsGateway.name);

  broadcastSeatUpdate(tripId: string, seatId: string, status: string) {
    this.logger.log(`Seat update broadcast: trip=${tripId}, seat=${seatId}, status=${status}`);
    // In production, emit to connected websocket room: `trip_${tripId}`
  }
}
