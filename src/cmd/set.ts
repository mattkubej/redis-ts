import RedisCommand from './redis-command';
import { Socket } from 'net';
import { NULL, OK } from '../resp/constants';
import { get, set } from '../db';

export default class Set extends RedisCommand {
  constructor() {
    super('set', -3, ['write', 'denyoom'], 1, 1, 1);
  }

  // TODO: clean this up
  execute(client: Socket, request: (number | string)[]): void {
    const key = String(request[1]);
    const value = String(request[2]);
    const option = request[3] ? String(request[3]).toLowerCase() : undefined;

    if (option === undefined) {
      set(key, value);
      client.write(OK);
    } else if (option === 'nx') {
      // set if key does not exist
      if (get(key) === undefined) {
        set(key, value);
        client.write(OK);
      } else {
        client.write(NULL);
      }
    } else if (option === 'xx') {
      // set if key already exists
      if (get(key) === undefined) {
        client.write(NULL);
      } else {
        set(key, value);
        client.write(OK);
      }
    } else {
      throw new Error('syntax error');
    }
  }
}
