import RedisCommand from './redis-command';
import { Socket } from 'net';
import * as cmd from './index';
import {
  encodeArray,
  encodeBulkString,
  encodeInteger,
  encodeSimpleString,
} from '../resp/encoder';

export default class Command extends RedisCommand {
  constructor(public commands: Map<string, cmd.RedisCommand>) {
    super('command', -1, ['loading', 'stale'], 0, 0, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(client: Socket, request: (number | string)[]): void {
    const allDetails = [this.addCommandReply(this)];

    this.commands.forEach((cmd) => {
      allDetails.push(this.addCommandReply(cmd));
    });

    const reply = encodeArray(allDetails);
    client.write(reply);
  }

  addCommandReply(cmd: cmd.RedisCommand): string {
    const details = [];

    details.push(encodeBulkString(cmd.name));
    details.push(encodeInteger(cmd.arity));

    const flags = cmd.flags.map(encodeSimpleString);
    details.push(encodeArray(flags));

    details.push(encodeInteger(cmd.firstKey));
    details.push(encodeInteger(cmd.lastKey));
    details.push(encodeInteger(cmd.keyStep));

    return encodeArray(details);
  }
}
