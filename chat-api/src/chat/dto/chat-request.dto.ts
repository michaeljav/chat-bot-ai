import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({ example: 'hello', description: 'User message' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Use LLM (Google Gemini) to answer',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  useLLM?: boolean = false;

  @ApiPropertyOptional({
    default: false,
    description: 'Allow Google Search (only if useLLM=true)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  useWeb?: boolean = false;
}
