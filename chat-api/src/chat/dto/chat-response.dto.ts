import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ example: 'Bot: hello', description: 'Bot reply' })
  reply!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether Google Search grounding was actually used',
  })
  grounded?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/article'],
    description: 'Source URLs when grounding was used',
  })
  sources?: string[];

  @ApiPropertyOptional({
    example: 'Dominican cuisine',
    description:
      'Current LLM domain configured on the server (LLM_DOMAIN). Empty means general assistant.',
  })
  domain?: string;
}
