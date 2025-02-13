import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Asset } from './entities/asset.entity';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class AssetsGateway {
  @WebSocketServer()
  socket: Socket;

  notifyNewPrice(asset: Asset) {
    this.socket.emit('newPrice', asset);
  }
}
