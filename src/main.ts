import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : process.env.NODE_ENV === 'production'
      ? [] // In production, require CORS_ORIGIN to be set
      : ['http://localhost:3000', 'http://localhost:5173']; // Development defaults

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Library Management System')
    .setDescription('The Library Management System API documentation')
    .setVersion('1.0')
    .addTag('books')
    .addTag('borrowers')
    .addTag('borrowing')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
        description: 'Enter your basic authentication credentials (email and password)',
      },
      'basic',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Library Management System API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    `,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(
    `Library Management System is running on: http://localhost:${port}`,
  );
  console.log(`API Documentation: http://localhost:${port}/api`);
}
bootstrap();
