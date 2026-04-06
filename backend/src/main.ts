import 'reflect-metadata';
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv is missing
}

import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module'; // 임포트를 상단으로 통일
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const isProduction = process.env.NODE_ENV === 'production';
  logger.log(`Starting application in ${process.env.NODE_ENV || 'development'} mode...`);

  if (!process.env.JWT_SECRET) {
    logger.warn('⚠️ WARNING: JWT_SECRET environment variable is not set.');
    if (isProduction) {
      logger.error('❌ CRITICAL: JWT_SECRET is required in production. Exiting.');
      process.exit(1);
    }
  }
  
  const rawPort = process.env.PORT || '8080';
  const port = parseInt(rawPort, 10);
  
  if (isNaN(port)) {
    logger.error(`❌ Invalid PORT value: ${rawPort}. Falling back to 8080.`);
    process.exit(1);
  }
  
  try {
    logger.log(`Initializing NestJS app with port ${port}...`);
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter());

    const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
    logger.log(`CORS_ORIGIN set to: ${rawOrigins}`);
    
    // Split origins carefully
    const origins = rawOrigins.split(/[;,]/).map(o => o.trim()).filter(Boolean);
    logger.log(`Parsed CORS Origins: ${JSON.stringify(origins)}`);
      
    app.enableCors({
      origin: origins.length > 0 ? origins : true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Accept,Authorization,x-tenant-id',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    if (!isProduction) {
      const config = new DocumentBuilder()
        .setTitle('Contract Ledger API')
        .setDescription('Tenant-Aware Audit & Notification API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    logger.log(`Attempting to listen on 0.0.0.0:${port}...`);
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Application is successfully listening on: http://0.0.0.0:${port}`);
  } catch (err) {
    logger.error('❌ Fatal error during bootstrap:', err);
    if (err instanceof Error) {
      logger.error(err.stack);
    }
    process.exit(1);
  }
}

bootstrap();

