import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Subscription } from './entities/subscription.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription, Company]),
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
