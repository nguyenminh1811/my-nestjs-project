import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, PinoLogger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import serverConfig, {
  NodeEnv,
  ServerConfig,
} from './config/types/server.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const sConfig: ServerConfig = app.get(serverConfig.KEY);

  if (sConfig.nodeEnv !== NodeEnv.PROD) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('My application service')
      .setDescription('My application service API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(sConfig.port);
}
bootstrap();

process.on('uncaughtExceptionMonitor', (err, origin) => {
  const logger = new PinoLogger({ renameContext: 'main' });
  logger.error({ error: err, origin }, `Caught exception: ${err}`);
});
