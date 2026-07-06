import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTenantRoom')
  async handleJoinTenantRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() tenantId: string,
  ) {
    if (tenantId) {
      await client.join(`tenant:${tenantId}`);
      this.logger.log(`Client ${client.id} joined room tenant:${tenantId}`);
      return { event: 'joinedRoom', data: `tenant:${tenantId}` };
    }
  }
}
