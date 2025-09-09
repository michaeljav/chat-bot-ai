import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  chat(@Body() body: CreateChatDto) {
    const reply = this.chatService.replyTo(body.message);
    return { reply };
  }
}
