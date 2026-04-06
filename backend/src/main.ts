import 'reflect-metadata';
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch (e) {
  // dotenv가 없을 경우 무시합니다.
}

import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // NODE_ENV 확인
  const isProduction = process.env.NODE_ENV === 'production';
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (!process.env.JWT_SECRET) {
    logger.warn('⚠️ WARNING: JWT_SECRET 환경 변수가 설정되지 않았습니다.');
    if (isProduction) {
      logger.error('❌ CRITICAL: 프로덕션 환경에서 JWT_SECRET은 필수입니다. 앱을 시작할 수 없습니다.');
      process.exit(1);
    }
  }
  
  // Cloud Run은 환경 변수로 '8080' (문자열)을 주입하므로 숫자로 변환합니다.
  const rawPort = process.env.PORT || '8080';
  const port = parseInt(rawPort, 10);
  
  if (isNaN(port)) {
    logger.error(`❌ Invalid PORT value: ${rawPort}. Falling back to 8080.`);
    process.exit(1);
  }
  
  try {
    const app = await NestFactory.create(appModule);

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter());

    const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
    logger.log(`CORS_ORIGIN: ${rawOrigins}`);
    
    const origins = rawOrigins.split(/[;,]/).map(o => o.trim()).filter(Boolean);
      
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

    // host를 '0.0.0.0'으로 지정하여 외부 연결을 허용합니다 (Cloud Run 필수).
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  } catch (err) {
    logger.error('❌ Fatal error during bootstrap:', err);
    if (err instanceof Error) {
      logger.error(err.stack);
    }
    process.exit(1);
  }
}

// AppModule imports must happen after reflect-metadata
import { AppModule as appModule } from './app.module';

bootstrap();
