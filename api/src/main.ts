import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('FCRM')
    .setDescription('The list of APIs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const docPath = join(__dirname, '..', 'doc');
  if (!existsSync(docPath)) {
    mkdirSync(docPath);
  }

  writeFileSync(
    join(docPath, 'openapi.json'),
    JSON.stringify(document, null, 2),
  );

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
