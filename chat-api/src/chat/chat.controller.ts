import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message and get a deterministic reply' })
  @ApiBody({ type: ChatRequestDto })
  @ApiOkResponse({ type: ChatResponseDto, description: 'Successful reply' })
  @ApiBadRequestResponse({
    description: 'Invalid body (missing/empty "message")',
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded (≤ 5 req/min/IP)',
  })
  chat(@Body() body: ChatRequestDto) {
    const reply = this.chatService.replyTo(body.message);
    return { reply };
  }
}
