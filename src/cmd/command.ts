import RedisCommand from './redis-command';
import { Socket } from 'net';
import * as cmd from './index';

export default class Command extends RedisCommand {
  constructor(public commands: Map<string, cmd.RedisCommand>) {
    super('command', -1, ['loading', 'stale'], 0, 0, 0);
  }

  execute(client: Socket, request: (number|string)[]) {
    console.log(this.commands);
    client.write('*6\r\n$3\r\nget\r\n:2\r\n*2\r\n+readonly\r\n+fast\r\n:1\r\n:1\r\n:1\r\n')
  }
}
