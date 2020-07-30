import RedisCommand from './redis-command';
import { Socket } from 'net';

export default class Ping extends RedisCommand {
  constructor() {
    super('ping', -1, ['stale', 'fast'], 0, 0, 0);
  }

  execute(client: Socket, request: (number|string)[]) {
    if (request.length > 2) {
      console.log(`wrong number of arguments for '${this.name}' command`)
    }

    client.write('+PONG\r\n');
  }
}
