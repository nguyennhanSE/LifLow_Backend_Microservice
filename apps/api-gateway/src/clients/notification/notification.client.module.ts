import { Module } from '@nestjs/common';
import { AppConfigModule } from 'libs/config';
import { NotificationClientService } from './notification.client.service';

@Module({
  imports: [AppConfigModule],
  providers: [NotificationClientService],
  exports: [NotificationClientService],
})
export class NotificationClientModule {}
