import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WsResponse, OnGatewayDisconnect, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
const rp = require('request-promise');
const requestOptions = {
  method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
  qs: {
    'symbol': 'BTC,LTC,DASH,ETH'
  },

  headers: {
    'X-CMC_PRO_API_KEY': 'f78fa793-b95e-4a58-a0ef-760f070defb0'
  },
  json: true,
  gzip: true
};
let count: number;

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');
  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): void {
    this.wss.emit('msgToClient', text)
    //return { event: 'msgToClient', data: text };
  }
  @SubscribeMessage('msgToCrypto')
  sendCryptoDate(client: Socket): void {
    setInterval(() => {
      if (client.connected) {
        rp(requestOptions).then(response => {
          let PriceCrypto = {
            BTC: response.data['BTC'].quote.USD.price.toFixed(2),
            ETH: response.data['ETH'].quote.USD.price.toFixed(2),
            DASH: response.data['DASH'].quote.USD.price.toFixed(2),
            LTC: response.data['LTC'].quote.USD.price.toFixed(2)
          }
          console.log(PriceCrypto);
          this.wss.emit('msgToCrypto', PriceCrypto);

        }).catch((err) => {
          console.log('API call error:', err.message);
        });
      }
    }, 10000)
  }
}