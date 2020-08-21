import RedisCommand from './redis-command';
import { Socket } from 'net';
import * as cmd from './index';
import {
  encodeArray,
  encodeBulkString,
  encodeInteger,
  encodeSimpleString,
} from '../resp/encoder';
import { Data } from '../resp/constants';

export default class Command extends RedisCommand {
  // TODO: build map of encodedArrays on command creation
  constructor(private commands: Map<string, cmd.RedisCommand>) {
    super('command', -1, ['loading', 'stale'], 0, 0, 0);
  }

  // TODO: can this get cleaned up?
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

  private addCommandReply(cmd: cmd.RedisCommand): string {
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
    const allDetails = [this.addCommandReply(this)];

    this.commands.forEach((cmd) => {
      allDetails.push(this.addCommandReply(cmd));
    });

    const reply = encodeArray(allDetails);
    client.write(reply);
  }

  // TODO: clean this up?
  private sendDetails(client: Socket, request: Data[]) {
    const details = [];

    for (let i = 2; i < request.length; i++) {
      const cmdName = String(request[i]).toLowerCase();
      const command = cmdName === this.name ? this : this.commands.get(cmdName);

      const detail = command
        ? this.addCommandReply(command)
        : encodeBulkString(null);

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
