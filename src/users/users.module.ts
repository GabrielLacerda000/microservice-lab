import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { IsEmailUniqueConstraint } from './validators/is-email-unique.constraint';

@Module({
  controllers: [UsersController],
  providers: [UsersService, IsEmailUniqueConstraint],
  exports: [UsersService],
})
export class UsersModule {}
