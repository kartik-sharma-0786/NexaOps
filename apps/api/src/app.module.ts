import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [AuthModule, IncidentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
