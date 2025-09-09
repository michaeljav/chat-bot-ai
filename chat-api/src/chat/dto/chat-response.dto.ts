import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ example: 'Bot: hello', description: 'Bot reply' })
  reply!: string;
}
