import { Module } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import {
  AdminPublishersController,
  PublishersController,
} from './publishers.controller';

@Module({
  controllers: [PublishersController, AdminPublishersController],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
