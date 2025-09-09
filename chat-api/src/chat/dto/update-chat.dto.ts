import { PartialType } from '@nestjs/mapped-types';
import { ChatRequestDto } from './chat-request.dto';

export class UpdateChatDto extends PartialType(ChatRequestDto) {}
