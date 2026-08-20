import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppConfigService } from 'libs/config';
import { ApiGatewayModule } from './api-gateway.module';

interface CorsConfig {
  enabled: boolean;
  origins: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
}

interface SecurityHeadersConfig {
  enabled: boolean;
  hstsEnabled: boolean;
  contentSecurityPolicy: string;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const SWAGGER_PATH = 'docs';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const configService = app.get(AppConfigService);

  configureCors(app, configService);
  configureSecurityHeaders(app, configService);
  configureRateLimit(app, configService);
  configureSwagger(app);

  const port = configService.get<number>('apiGateway.port', 3500);
  await app.listen(port);
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Liflow API Gateway')
    .setDescription('HTTP API documentation for Liflow API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

function configureCors(app: INestApplication, configService: AppConfigService) {
  const corsConfig = configService.get<CorsConfig>('apiGateway.cors');
  if (!corsConfig?.enabled) {
    return;
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsConfig.origins.includes('*')) {
        callback(null, true);
        return;
      }

      callback(null, corsConfig.origins.includes(origin));
    },
    credentials: corsConfig.credentials,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
  });
}

function configureSecurityHeaders(
  app: INestApplication,
  configService: AppConfigService,
) {
  const securityHeadersConfig = configService.get<SecurityHeadersConfig>(
    'apiGateway.securityHeaders',
  );
  if (!securityHeadersConfig?.enabled) {
    return;
  }

  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.removeHeader('X-Powered-By');
    response.setHeader('X-DNS-Prefetch-Control', 'off');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );

    if (!_request.path.startsWith(`/${SWAGGER_PATH}`)) {
      response.setHeader(
        'Content-Security-Policy',
        securityHeadersConfig.contentSecurityPolicy,
      );
    }

    if (securityHeadersConfig.hstsEnabled) {
      response.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    next();
  });
}

function configureRateLimit(
  app: INestApplication,
  configService: AppConfigService,
) {
  const rateLimitConfig = configService.get<RateLimitConfig>(
    'apiGateway.rateLimit',
  );
  if (!rateLimitConfig?.enabled) {
    return;
  }

  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.method === 'OPTIONS') {
      next();
      return;
    }

    const now = Date.now();
    const clientId = getClientId(request);
    const current = rateLimitStore.get(clientId);

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetAt: now + rateLimitConfig.windowMs,
      });
      next();
      return;
    }

    current.count += 1;

    if (current.count > rateLimitConfig.max) {
      response.setHeader(
        'Retry-After',
        Math.ceil((current.resetAt - now) / 1000),
      );
      response.status(429).json({
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      });
      return;
    }

    next();
  });
}

function getClientId(request: Request): string {
  const forwardedFor = request.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0];

  return forwardedIp?.trim() || request.ip || 'unknown';
}

bootstrap();
