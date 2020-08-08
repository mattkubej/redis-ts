import RedisCommand from './redis-command';
import { Socket } from 'net';
import { encodeSimpleString } from '../resp/encoder';

export default class Ping extends RedisCommand {
  constructor() {
    super('ping', -1, ['stale', 'fast'], 0, 0, 0);
  }

  execute(client: Socket, request: (number | string)[]): void {
    if (request.length > 2) {
      console.log(`wrong number of arguments for '${this.name}' command`);
    }

    const reply = encodeSimpleString('PONG');
    client.write(reply);
  }
}
