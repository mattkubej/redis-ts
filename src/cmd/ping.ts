import RedisCommand from './redis-command';
import { Socket } from 'net';
import { encodeSimpleString } from '../resp/encoder';
import { Data } from '../resp/constants';

export default class Ping extends RedisCommand {
  constructor() {
    super('ping', -1, ['stale', 'fast'], 0, 0, 0);
  }

  execute(client: Socket, request: Data[]): void {
    if (request.length > 2) {
      throw new Error(`wrong number of arguments for '${this.name}' command`);
    }

    const message = request[1] ? String(request[1]) : 'PONG';
    const reply = encodeSimpleString(message);
    client.write(reply);
  }
}
