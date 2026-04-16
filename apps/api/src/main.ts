import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AppConfigService } from './common/config/config.service.js';
import { LoggerService } from './common/logger/logger.service.js';
import { INestApplication } from '@nestjs/common';
import secureSession from '@fastify/secure-session';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(AppConfigService);

  const sessionSecret = configService.sessionSecret;
  const key = Buffer.from(sessionSecret.padEnd(32, '0').slice(0, 32), 'utf-8');
  await app.register(secureSession as never, {
    key,
    cookie: {
      httpOnly: true,
      secure: configService.isProd,
      sameSite: 'strict',
    },
  });

  app.enableCors({
    origin: configService.corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useLogger(app.get(LoggerService));
  app.enableShutdownHooks();

  if (!configService.isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Lungilicious API')
      .setDescription('Premium botanical wellness e-commerce API')
      .setVersion('1.0')
      .addCookieAuth('session')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.port;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
