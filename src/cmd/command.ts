import RedisCommand from './redis-command';
import { Socket } from 'net';
import * as cmd from './index';

export default class Command extends RedisCommand {
  constructor(public commands: Map<string, cmd.RedisCommand>) {
    super('command', -1, ['loading', 'stale'], 0, 0, 0);
  }

  execute(client: Socket, request: (number|string)[]) {
    const allDetails = [this.addCommandReply(this)];

    this.commands.forEach((cmd) => {
      allDetails.push(this.addCommandReply(cmd));
    });

    const reply = this.encodeArray(allDetails);
    client.write(reply);
  }

  addCommandReply(cmd: cmd.RedisCommand): string {
    const details = [];

    details.push(this.encodeBulkString(cmd.name));
    details.push(this.encodeInteger(cmd.arity));

    const flags = cmd.flags.map(this.encodeSimpleString);
    details.push(this.encodeArray(flags));

    details.push(this.encodeInteger(cmd.firstKey));
    details.push(this.encodeInteger(cmd.lastKey));
    details.push(this.encodeInteger(cmd.keyStep));

    return this.encodeArray(details);
  }

  encodeSimpleString(value: string): string {
    return `+${value}\r\n`;
  }

  encodeBulkString(value: string): string {
    return `$${value.length}\r\n${value}\r\n`;
  }

  encodeInteger(value: number): string {
    return `:${value}\r\n`;
  }

  encodeArray(values: string[]): string {
    return values.reduce(function(acc, cur) {
      return acc += cur;
    }, `*${values.length}\r\n`);
  }
}
