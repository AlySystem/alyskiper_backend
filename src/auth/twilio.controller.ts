import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { twilioDto } from './input/signIn.dto';
import { UserService } from "../mapping/users/user.service";

@Controller('twilio')
export class TwilioController {

  // Injectando las dependencias necesarias para el funcionamiento correcto del controllador
  constructor(
    private twilioService: TwilioService,
    private userService: UserService
  ) { }

  @Post('send_code')
  async login(@Body() twilio: twilioDto): Promise<any> {
    // Usando el servicio para enviar un codigo
    return this.twilioService.sendCode(twilio);
  }

  @Post('verify_code')
  async register(@Body() twilio: twilioDto): Promise<any> {
    // Usando el metodo para verificar el codigo que se fue enviado
    let result
    const user = await this.userService.findByPhone(twilio.phone_number);
    if (user) {
      result = this.twilioService.verifyCode(twilio);
      return {data: {ok:true,status:200,data:{sata:result,id:user.id}}}
    }
    
  }

  // Endpoint para enviar un codigo con twilio cuando quiera recuperar el password una vez lo haya olvidado.
  @Post('reset_password')
  async resetPassword(@Body() email: string): Promise<any> {
    const user = await this.userService.findByEmail(email); // Buscar el usuario correspondiente al id
    if (user) {// si el usuario existe
      const twilio: twilioDto = new twilioDto(); // Nuevo objeto de tipo twilio
      twilio.phone_number = user.phone; //Pasando los valores
      twilio.channel = 'sms';
      let result = this.twilioService.sendCode(twilio); // Usando el servicio de twilio para enviar un codigo
      return {data: {ok:true,status:200,result:result,phone_number:user.phone}}
    } else {
      return { error: { message: 'The user dont exist', ok: true, status: 404 } } // El usuario a buscar no existe
    }
  }
}