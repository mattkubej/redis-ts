import RedisCommand from './redis-command';
import { Socket } from 'net';
import { encodeBulkString } from '../resp/encoder';
import { get } from '../db';
import { NULL } from '../resp/constants';

export default class Get extends RedisCommand {
  constructor() {
    super('get', 2, ['readonly', 'fast'], 1, 1, 1);
  }

  // TODO: match abstract class
  execute(client: Socket, request: (number | string)[]): void {
    const key = String(request[1]);
    const value = get(key);

    if (value === undefined) {
      client.write(NULL);
    } else {
      const reply = encodeBulkString(value);
      client.write(reply);
    }
  }
}
