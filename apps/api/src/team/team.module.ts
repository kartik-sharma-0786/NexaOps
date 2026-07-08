import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtExpiresIn, getJwtSecret } from '../auth/jwt.config';
import { NotificationsModule } from '../notifications/notifications.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    NotificationsModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: getJwtExpiresIn() },
      }),
    }),
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
