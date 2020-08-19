import RedisCommand from './redis-command';
import { Socket } from 'net';
import { OK } from '../resp/constants';
import { set } from '../db';

export default class Set extends RedisCommand {
  constructor() {
    // TODO: validate these are correct
    super('set', -3, ['write', 'denyoom'], 1, 1, 1);
  }

  // TODO: handle all variations
  execute(client: Socket, request: (number | string)[]): void {
    const key = String(request[1]);
    const value = String(request[2]);

    set(key, value);

    client.write(OK);
  }
}
