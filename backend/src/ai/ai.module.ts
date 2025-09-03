import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Property } from '../properties/entities/property.entity';
import { Activity } from '../activities/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal, Property, Activity])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
