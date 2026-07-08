import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type SocketUser = {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
};

const corsOrigins = (
  process.env.CORS_ORIGINS ??
  process.env.NEXTAUTH_URL ??
  'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        throw new Error('Missing auth token');
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
        tenantId: string;
      }>(token);

      const user: SocketUser = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };
      client.data.user = user;

      // Tenant room membership is derived from the verified token only.
      await client.join(`tenant:${user.tenantId}`);
      this.logger.log(
        `Client ${client.id} authenticated and joined tenant:${user.tenantId}`,
      );
    } catch {
      this.logger.warn(
        `Client ${client.id} rejected: invalid or missing token`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Kept for backwards compatibility with older clients. The requested
  // tenant is ignored; the room comes from the verified JWT.
  @SubscribeMessage('joinTenantRoom')
  async handleJoinTenantRoom(@ConnectedSocket() client: Socket) {
    const user = client.data.user as SocketUser | undefined;
    if (!user) {
      client.disconnect(true);
      return;
    }
    await client.join(`tenant:${user.tenantId}`);
    return { event: 'joinedRoom', data: `tenant:${user.tenantId}` };
  }
}
