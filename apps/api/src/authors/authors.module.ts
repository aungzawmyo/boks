import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AdminAuthorsController, AuthorsController } from './authors.controller';

@Module({
  controllers: [AuthorsController, AdminAuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
