import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { OrdersService } from './orders.service';
import { Repository } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';

// Definição de um tipo customizado caso o client tenha um `user`
interface CustomSocket extends Socket {
  data: {
    userId: number;
  };
}

@WebSocketGateway()
export class OrdersGateway {
  constructor(
    private ordersService: OrdersService,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  @SubscribeMessage('message')
  handleMessage(client: CustomSocket, payload: any) {
    console.log(payload);
    client.emit('response', 'Recebi sua mensagem');
  }

  @SubscribeMessage('createOrder')
  async createOrder(
    client: CustomSocket,
    payload: {
      assetId: number;
      shares: number;
      price: number;
    },
  ) {
    if (!client.data.userId) {
      client.emit('error', 'Usuário não autenticado');
      return;
    }

    const wallet = await this.walletRepository.findOne({
      where: {
        userId: client.data.userId,
      },
    });

    if (!wallet) {
      client.emit('error', 'Carteira não encontrada');
      return;
    }

    const orderCreated = await this.ordersService.create({
      walletId: wallet.id,
      assetId: payload.assetId,
      price: payload.price,
      shares: payload.shares,
    });

    client.emit('response', 'Ordem criada com sucesso');
    return orderCreated;
  }
}
