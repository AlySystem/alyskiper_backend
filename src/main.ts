import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
//import { HttpExcepcionFilter } from './shared/http.exception.filter';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {

  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.useStaticAssets(join(__dirname, '..', 'static'));
  //Add GlobalPipes
  app.useGlobalPipes(new ValidationPipe());

  //Add Global Filter
  //app.useGlobalFilters(new HttpExcepcionFilter())

  //Add prefix to api rest cec67c9c025ddc79fdaf00202aec05de489207f1
  app.setGlobalPrefix('/v1/api');

  // Add Cors universal
  const options = {
    "origin": "*",
    "Access-Control-Allow-Origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    // "credentials": true
  }
  app.enableCors(options);

  //Add Security
  app.use(helmet());

  //Add Compression
  app.use(compression());

  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*');
  //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  //   res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  //   next();
  // });

  await app.listen(process.env.PORT || 3000);

}
bootstrap();