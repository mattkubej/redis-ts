import RedisCommand from './redis-command';
import { Socket } from 'net';

export default class Echo extends RedisCommand {
  constructor() {
    super('echo', 2, ['fast'], 0, 0, 0);
  }

  execute(client: Socket, request: (number|string)[]) {
    const message = String(request[1]);
    const length = message.length;
    client.write(`$${length}\r\n${message}\r\n`);
  }
}
