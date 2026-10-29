import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { SeatsGateway } from './seats.gateway';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SeatsController],
  providers: [SeatsService, SeatsGateway],
  exports: [SeatsService],
})
export class SeatsModule {}
