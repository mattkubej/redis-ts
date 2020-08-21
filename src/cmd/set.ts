import RedisCommand from './redis-command';
import { Socket } from 'net';
import { Data, NULL, OK } from '../resp/constants';
import { get, set } from '../db';

export default class Set extends RedisCommand {
  constructor() {
    super('set', -3, ['write', 'denyoom'], 1, 1, 1);
  }

  execute(client: Socket, request: Data[]): void {
    const key = String(request[1]);
    const value = String(request[2]);
    const option = request[3] ? String(request[3]).toLowerCase() : undefined;

    if (
      option === undefined ||
      (option === 'nx' && get(key) === undefined) ||
      (option === 'xx' && get(key) !== undefined)
    ) {
      set(key, value);
      client.write(OK);
    } else if (
      (option === 'nx' && get(key) !== undefined) ||
      (option === 'xx' && get(key) === undefined)
    ) {
      client.write(NULL);
    } else {
      throw new Error('syntax error');
    }
  }
}
