import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // If running behind a proxy/load balancer, uncomment:
  // app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- Swagger ---
  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('Minimal chat API with validation and rate-limit')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  // ---------------

  await app.listen(3000, '0.0.0.0');
  // console.log(`Server running at http://localhost:3000`);
}
bootstrap();
