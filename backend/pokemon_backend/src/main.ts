import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with your React app's specific origin
  // This is crucial to allow your frontend (localhost:5173) to communicate with your backend (localhost:3000)
  app.enableCors({
    origin: 'http://localhost:5173', // <--- IMPORTANT: Set this to your React app's actual origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you eventually use cookies or authorization headers that require credentials
  });

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // This enables automatic transformation of payload to DTO instance
      whitelist: true, // Strips away properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are sent
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
