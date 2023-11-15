import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MESSAGING_SERVICE_ID || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error("Missing required environment variables");
  process.exit(1);
}

export type RawMessage = {
    From: string
    Body: string
    ProfileName: string
    ButtonPayload: string
    NumMedia:  string
    MediaUrl0: string
    MediaContentType0: string
    SmsSid: string
}

class ClientMessage {
  
    from = '';
    body = '';
    contact = {
        number: '',
        name: ''
    };
    buttonAction = '';
    hasMedia = false;
    mediaUrl = '';
    mediaType = '';
    id = '';

    constructor(message: RawMessage){
      console.log('raw : ', message);
      this.from = message.From
      this.body = message.Body
      this.contact = {
        number: message.From.substr(message.From.indexOf('whatsapp:+')),
        name: message.ProfileName
      }
      this.buttonAction = message.ButtonPayload
      this.hasMedia = Number(message.NumMedia) > 0
      this.mediaUrl = message.MediaUrl0
      this.mediaType = message.MediaContentType0
      this.id  =message.SmsSid
    }
  
    getClientMessage(){
      return this.body;
    }
  
    getContact(){
      return this.contact;
    }

    async downloadMedia(){
      return {
        mimetype: this.mediaType,
        url: this.mediaUrl
      }
    }

}

type Content = {
  body?: string;
  contentSid?: string;
  contentVariables?: string;
}

export class Client {

  client:any

  constructor(){
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = twilio(accountSid, authToken);
  }

  sendMessage(chatId: string, content: string | Content, extra: any ){

    const _content = typeof content == 'string' ? { body : content} : content
    
    return this.client.messages.create({
      from: process.env.MESSAGING_SERVICE_ID, 
      to: chatId,
      ..._content,
    })
  }
}

const WhatsAppClient = {
  Message: ClientMessage,
  Client: Client
}

export type Message = ClientMessage
export type Contact = {
  number: string,
  name: string
}

export default WhatsAppClient 