import RedisCommand from './redis-command';
import { Socket } from 'net';
import { Data, OK } from '../resp/constants';

export default class Quit extends RedisCommand {
  constructor() {
    super('quit', 1, ['fast'], 0, 0, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(client: Socket, request: Data[]): void {
    client.write(OK);
    client.destroy();
  }
}
