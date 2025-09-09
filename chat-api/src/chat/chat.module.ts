import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { LlmService } from '../llm/llm.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, LlmService],
})
export class ChatModule {}
