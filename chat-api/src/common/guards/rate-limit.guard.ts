import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  // TooManyRequestsException,
} from '@nestjs/common';
import { Request } from 'express';

// Config
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQS = 5;

type Bucket = { count: number; resetAt: number };

@Injectable()
export class RateLimitGuard implements CanActivate {
  private buckets = new Map<string, Bucket>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.path || req.url || '';
    if (path === '/' || path.startsWith('/docs')) return true; // allow root & Swagger

    const ip = this.getClientIp(req);
    const now = Date.now();
    const bucket = this.buckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
      this.buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    if (bucket.count >= MAX_REQS) {
      const secondsLeft = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
      throw new BadRequestException(
        `Rate limit exceeded. Try again in ~${secondsLeft}s`,
      );
    }

    bucket.count += 1;
    return true;
  }

  private getClientIp(req: Request): string {
    // If behind a proxy and 'trust proxy' is enabled in main.ts,
    // req.ip will reflect X-Forwarded-For.
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
