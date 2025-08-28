import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { UsersController } from './users.controller';

// Services
import { UsersService } from './users.service';

// Entities
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}