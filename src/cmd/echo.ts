import RedisCommand from './redis-command';
import { Socket } from 'net';
import { encodeBulkString } from '../resp/encoder';
import { Data } from '../resp/constants';

export default class Echo extends RedisCommand {
  constructor() {
    super('echo', 2, ['fast'], 0, 0, 0);
  }

  execute(client: Socket, request: Data[]): void {
    const message = String(request[1]);
    const reply = encodeBulkString(message);
    client.write(reply);
  }
}
