import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [ChatModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RateLimitGuard }, // bonus: global rate limit
  ],
})
export class AppModule {}
