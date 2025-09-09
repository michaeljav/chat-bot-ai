import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>Chat API</title>
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 2rem; }
            .card { max-width: 640px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; }
            a { text-decoration: none; }
            .btn { display: inline-block; padding: .6rem 1rem; border-radius: 8px; border: 1px solid #d1d5db; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Chat API</h1>
            <p>Server is up. Docs are here:</p>
            <p><a class="btn" href="/docs">➡️ Go to Swagger UI</a></p>
            <hr/>
            <p>Try <code>POST /chat</code> with body <code>{"message":"hello"}</code>.</p>
          </div>
        </body>
      </html>
    `;
  }
}
