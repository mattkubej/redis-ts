import RedisCommand from './redis-command';
import { Socket } from 'net';

export default class Command extends RedisCommand {
  constructor() {
    super('command', -1, ['loading', 'stale'], 0, 0, 0);
  }

  execute(client: Socket, request: (number|string)[]) {
  }
}
