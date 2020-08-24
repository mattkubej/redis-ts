import RedisCommand from './redis-command';
import { Socket } from 'net';
import {
  encodeArray,
  encodeBulkString,
  encodeInteger,
  encodeSimpleString,
} from '../resp/encoder';
import { Data, NULL } from '../resp/constants';

export default class Command extends RedisCommand {
  private details: Map<string, string>;

  constructor(private commands: Map<string, RedisCommand>) {
    super('command', -1, ['loading', 'stale'], 0, 0, 0);

    this.details = this.buildDetails();
  }

  private buildDetails(): Map<string, string> {
    const details = new Map();

    details.set(this.name, this.addCommandReply(this));
    this.commands.forEach((cmd) => {
      details.set(cmd.name, this.addCommandReply(cmd));
    });

    return details;
  }

  execute(client: Socket, request: Data[]): void {
    if (request.length === 1) {
      this.sendAllDetails(client);
    } else if (String(request[1]).toLowerCase() === 'info') {
      this.sendDetails(client, request);
    } else if (
      String(request[1]).toLowerCase() === 'count' &&
      request.length === 2
    ) {
      this.sendCount(client);
    } else {
      throw new Error('unknown subcommand or wrong number of arguments');
    }
  }

  private addCommandReply(cmd: RedisCommand): string {
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

  private sendAllDetails(client: Socket) {
    const allDetails = Array.from(this.details.values());
    const reply = encodeArray(allDetails);
    client.write(reply);
  }

  private sendDetails(client: Socket, request: Data[]) {
    const details = [];

    for (let i = 2; i < request.length; i++) {
      const cmdName = String(request[i]).toLowerCase();
      const detail = this.details.get(cmdName) || NULL;
      details.push(detail);
    }

    const reply = encodeArray(details);
    client.write(reply);
  }

  private sendCount(client: Socket) {
    const reply = encodeInteger(this.commands.size + 1);
    client.write(reply);
  }
}
