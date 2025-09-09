import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ example: 'hello', description: 'User message' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
