import {
  SubscribeMessage, WebSocketGateway,
  OnGatewayInit, WsResponse, OnGatewayDisconnect,
  OnGatewayConnection, WebSocketServer, MessageBody
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';


@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {  

  userSilver = new Map()
  userGold = new Map()
  userVip = new Map()
  userPresident = new Map()

  rooms = new Map()

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Initialized');

    this.rooms.set(1, "SilverRoom")
    this.rooms.set(2, "GoldRoom")
    this.rooms.set(3, "VipRoom")
    this.rooms.set(4, "PresidentRoom")

  }




  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    let user = null
    if (this.userSilver.has(client.id)) {
      user = this.userSilver.get(client.id)
      this.userSilver.delete(client.id)
    } else
      if (this.userGold.has(client.id)) {
        user = this.userGold.get(client.id)
        this.userGold.delete(client.id)
      } else
        if (this.userVip.has(client.id)) {
          user = this.userVip.get(client.id)
          this.userVip.delete(client.id)
        } else
          if (this.userPresident.has(client.id)) {
            user = this.userPresident.get(client.id)
            this.userPresident.delete(client.id)
          } else {
            this.logger.log("USUARIO NO ENCONTRADO")
          }
    this.logger.debug("USUARIO DESCONECTADO " + JSON.stringify(user))
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.debug("query")
    this.logger.debug(client.handshake.query)

    let drive = client.handshake.query.drive

    if (!drive) {
      console.log("drive es null")
      return
    }
     
    this.wss.emit('testing', "tonces perro desde afuera")
    setTimeout(_=> {
      this.wss.emit('testing', "tonces perro")
    },3000)
    console.log(drive)
    if (typeof (drive) === 'string') {
      if (drive === '[object Object]') {
        client.disconnect()
        this.logger.debug("QUERY ENVIADO COMO OBJECT")
        return
      }
      console.log("Parsar Objeto")
      drive = JSON.parse(drive)
    }

    switch (drive.categoryId) {
      case 1://Silver
        this.userSilver.set(client.id, drive)
        //client.join(this.silverRoom)
        break;
      case 2: //Gold
        this.userGold.set(client.id, drive)
        //client.join(this.goldRoom)
        break;
      case 3: //vip
        this.userVip.set(client.id, drive)
        //client.join(this.vipRoom)
        break;
      case 4: //President
        this.userPresident.set(client.id, drive)
        //client.join(this.presiendtRoom)
        break;
      default:
        this.logger.log("USUARIO NO ENVIO CATID")
        client.disconnect();
    }
    //x client.join("global")
    
    this.logger.log(JSON.stringify(drive))

  }

  private listUsers(categoryId) {
    let users = null
    switch (categoryId) {
      case 1:
        users = this.userSilver
        break
      case 2:
        users = this.userGold
        break
      case 3:
        users = this.userVip
        break
      case 4:
        users = this.userPresident
        break
      case 10:
        users = new Map([...this.userSilver].concat([...this.userGold]).concat([...this.userVip]).concat([...this.userPresident]))
        break
      default:
        this.logger.debug("CATEGORIA INEXISTENTE - " + categoryId)
    }
    return users
  }

  @SubscribeMessage('getUsers')
  listarUsuarios(client: Socket, text):WsResponse<Object> {
    console.log("el texto", text)
    let request = JSON.parse(text)
    let arr = []
    let usuarios = this.listUsers(request.categoryId)

    usuarios.forEach((value, key) => {
      arr.push(value)
      console.log(key + JSON.stringify(value))
    })

    this.wss.emit('users', arr)

    console.log(arr)
    
    return { event:'getUsers', data: arr }
  }

  @SubscribeMessage('setLocation')
  setLocation(client: Socket, text: string): void {
    let request = JSON.parse(text)

    if (!request.categoryId) {
      console.log(JSON.stringify(request))
      this.logger.debug("CATID NO DEFINIDO")
      return
    }

    let map = this.listUsers(request.categoryId)

    let user = map.get(client.id)

    map.set(client.id, user)
    // this.wss.emit('users',"ok")
    console.log("Location seteada")
    console.log(user)
  }

  @SubscribeMessage('global')
  handleGlobal(client: Socket, text: any): void {
    
    //this.logger.log(client)
    text.socketId = client.id
    this.logger.log(text)
    this.wss.sockets.emit('global', text)
    //this.logger.log(this.wss.clients())

    //return { event: 'msgToClient', data: text };
  }

  @SubscribeMessage('categoria')
  handleCategoria(client: Socket, text: any): void {
    
    //this.logger.log(client)
    text.socketId = client.id
    this.logger.log(text)

    let categoryId = text.categoryId
    if(categoryId){
      if(this.rooms.has(categoryId))
        this.wss.sockets.emit(this.rooms.get(categoryId), text)
    }
    
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): void {
    this.wss.emit('msgToClient', text)
    //this.logger.log(client)
    this.logger.log(text)
    //this.logger.log(this.wss.clients())

    //return { event: 'msgToClient', data: text };
  }
}
