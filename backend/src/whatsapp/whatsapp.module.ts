import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppChat } from './entities/whatsapp-chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsAppChat]),
    ConfigModule,
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}