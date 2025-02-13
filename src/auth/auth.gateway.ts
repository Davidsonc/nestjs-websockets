import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

// Define a interface para garantir que `data` tenha `userId`
interface AuthenticatedSocket extends Socket {
  data: {
    userId: number;
  };
}

interface JwtPayload {
  sub: number;
}

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection {
  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const authHeader = client.handshake.headers?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Token ausente ou mal formado');
        client.disconnect();
        return;
      }

      const token = authHeader.split(' ')[1];
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);

      client.data = { userId: payload.sub }; // Agora, TypeScript reconhece `data.userId`

      console.log(`Usuário conectado: ${client.data.userId}`);
    } catch (e: unknown) {
      // Tipando o erro como `unknown`
      if (e instanceof Error) {
        console.error('Erro ao verificar token:', e.message); // Acessa `message` com segurança
      } else {
        console.error('Erro desconhecido ao verificar token');
      }
      client.disconnect();
    }
  }
}
