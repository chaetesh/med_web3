import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Log environment variables (except secrets)
  logger.log(
    `NODE_ENV: ${configService.get<string>('NODE_ENV', 'development')}`,
  );
  logger.log(`MONGODB_URI: ${configService.get<string>('MONGODB_URI')}`);
  logger.log(`IPFS_API_URL: ${configService.get<string>('IPFS_API_URL')}`);
  logger.log(
    `POLYGON_RPC_URL: ${configService.get<string>('POLYGON_RPC_URL')}`,
  );
  logger.log(
    `POLYGON_CONTRACT_ADDRESS: ${configService.get<string>('POLYGON_CONTRACT_ADDRESS')}`,
  );

  const port = configService.get<number>('PORT', 3001);
  logger.log(`Application will start on port: ${port}`);

  // Security and validation
  app.use(helmet());
  app.enableCors({
    origin:
      configService.get('NODE_ENV') === 'production'
        ? 'https://yourdomain.com'
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`MediChain.AI API running on port ${port}`);
}
bootstrap();
