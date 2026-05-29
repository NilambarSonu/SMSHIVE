import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // In production, origins come from config. For simplicity here, allow all or implement a check.
      // Better: Inject ConfigService and use it.
      callback(null, true);
    },
    credentials: true,
  },
})
export class GatewayEvents implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GatewayEvents.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.deviceId) {
      return { status: 'error', message: 'deviceId is required' };
    }
    this.logger.log(`Device registered for real-time updates: ${data.deviceId} (socket: ${client.id})`);
    client.join(`device_${data.deviceId}`);
    return { status: 'ok' };
  }

  emitNewSms(deviceId: string, sms: any) {
    this.logger.log(`Pushing new SMS to device ${deviceId} via WebSocket`);
    this.server.to(`device_${deviceId}`).emit('new_sms', sms);
  }
}
