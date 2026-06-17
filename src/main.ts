import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrderModule } from './order/order.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Order Management System API')
    .setDescription('COSMOS imagery ordering API')
    .setVersion('1.1.0')
    .addSecurity('api-key', {
      type: 'apiKey',
      in: 'header',
      name: 'api-key',
    })
    .addSecurityRequirements('ApiKeyAuth')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      OrderModule,
      CatalogModule
    ]
  });
  SwaggerModule.setup('/api-docs-light', app, document, {
    customCss: `.topbar { display:none }`
  });
  SwaggerModule.setup('/api-docs-dark', app, document, {
    customJs: '/static/swagger-dark.js',
    customCss: `.topbar { display:none }`
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap(); 