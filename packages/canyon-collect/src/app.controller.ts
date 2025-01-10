import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 注入 ClientProxy 用于发送消息
  @Client({
    transport: Transport.KAFKA, // 或使用 Transport.REDIS, Transport.NATS 等其他传输方式
    options: {
      client: {
        brokers: ['192.168.2.104:9004'], // Kafka 集群地址
      },
    },
  })
  private client: ClientProxy;

  // 新增的发送消息的 GET 请求
  @Get('send-message')
  async sendMessage(): Promise<string> {
    const message = { content: 'Hello from AppController' };
    const key = 'message-key'; // 你可以自定义一个 key

    // 使用 ClientProxy 发送消息，指定 key 和 value
    this.client.emit('wuya-feiji', {
      key: key,
      value: message,
    });
    return 'Message sent';
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
