import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NoCacheInterceptor } from './no-cache.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableVersioning({
    type: VersioningType.URI,
  });
  const config = new DocumentBuilder()
    .setTitle('Prop Firm API')
    .setDescription('API documentation for the Prop Firm application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1",app, document)
  
  app.enableCors({
      origin: [,"http://localhost:8080"], // Your frontend URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,

  });
  app.useGlobalInterceptors(new NoCacheInterceptor());
  
  await app.listen(4000);

  console.log('Application is running on: http://localhost:4000');
}
bootstrap();