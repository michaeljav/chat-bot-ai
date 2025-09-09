import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('chat')
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @ApiOperation({
    summary:
      'Send a message and get a reply (LLM optional; Google Search optional)',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiOkResponse({ type: ChatResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async chat(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    const out = await this.chatService.replyTo(body.message, {
      useLLM: body.useLLM,
      useWeb: !!body.useLLM && !!body.useWeb,
    });

    return {
      reply: out.text,
      grounded: out.grounded,
      sources: out.sources,
      domain: out.domain,
    };
  }
}
