import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { LeadsController } from './leads.controller';

// Services
import { LeadsService } from './leads.service';

// Entities
import { Lead } from './entities/lead.entity';
import { LeadSource } from './entities/lead-source.entity';

// Auth
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadSource]), AuthModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
