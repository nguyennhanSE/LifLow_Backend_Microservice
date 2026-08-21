import { Module } from '@nestjs/common';
import { EventsGrpcController } from '../../grpc/events/events.grpc.controller';
import { EventsMessagingController } from '../../messaging/events/events.messaging.controller';
import { EventRepository } from './repositories/event.repository';
import { EventService } from './event.service';

@Module({
  controllers: [EventsMessagingController, EventsGrpcController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventModule {}
