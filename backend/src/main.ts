import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application using the root AppModule
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so the frontend (running on a different port) can talk to this backend
  app.enableCors();
  
  // Start listening for requests on port 4000
  await app.listen(4000);
  console.log('Application is running on: http://localhost:4000');
}
bootstrap();
