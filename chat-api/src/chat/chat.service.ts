import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  replyTo(message: string): string {
    // Option A: prefix
    return `Bot: ${message}`;

    // Option B: uppercase
    // return message.toUpperCase();
  }
}
