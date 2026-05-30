import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { WebSocket } from 'ws';

@WebSocketGateway({
  path: '/api/ws',
})
export class GatewayEvents implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GatewayEvents.name);
  private activeConnections = new Map<string, WebSocket[]>();

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected to SMS Gateway WebSocket');

    client.on('message', (message: any) => {
      try {
        const json = JSON.parse(message.toString());
        if (json?.deviceId) {
          const deviceId = json.deviceId;
          this.logger.log(`Device registered for real-time updates: ${deviceId}`);
          
          // Store connection
          const existing = this.activeConnections.get(deviceId) || [];
          existing.push(client);
          this.activeConnections.set(deviceId, existing);

          // Tag client for easier disconnection cleanup
          (client as any).deviceId = deviceId;

          // Send confirmation back to device
          client.send(JSON.stringify({ type: 'registered', status: 'ok' }));
        }
      } catch (err: any) {
        this.logger.error(`Failed to handle WebSocket message: ${err.message}`);
      }
    });

    client.on('error', (err) => {
      this.logger.error(`WebSocket client error: ${err.message}`);
    });
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('Client disconnected from SMS Gateway WebSocket');
    const deviceId = (client as any).deviceId;
    if (deviceId) {
      const existing = this.activeConnections.get(deviceId) || [];
      const updated = existing.filter((c) => c !== client);
      if (updated.length > 0) {
        this.activeConnections.set(deviceId, updated);
      } else {
        this.activeConnections.delete(deviceId);
      }
      this.logger.log(`Cleaned up WebSocket connection for device: ${deviceId}`);
    }
  }

  emitNewSms(deviceId: string, sms: any) {
    this.logger.log(`Pushing new SMS to device ${deviceId} via WebSocket`);
    const clients = this.activeConnections.get(deviceId);
    if (clients && clients.length > 0) {
      const payload = JSON.stringify({
        type: 'new_sms',
        data: sms,
      });
      clients.forEach((client) => {
        try {
          if (client.readyState === 1) { // 1 = OPEN
            client.send(payload);
            this.logger.log(`Successfully dispatched real-time SMS to device ${deviceId}`);
          }
        } catch (err: any) {
          this.logger.error(`Failed to send SMS payload to WebSocket client: ${err.message}`);
        }
      });
    } else {
      this.logger.warn(`No active WebSocket connections found for device ${deviceId}`);
    }
  }
}
