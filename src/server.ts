import { createServer, Server, Socket } from 'net';
import { decode } from './resp/decoder';
import { encodeError } from './resp/encoder';
import * as cmd from './cmd';

export default class RedisServer {
  private commands: Map<string, cmd.RedisCommand>;

  constructor() {
    this.commands = new Map();
    this.registerCommands();
  }

  private registerCommands() {
    this.commands.set('echo', new cmd.Echo());
    this.commands.set('get', new cmd.Get());
    this.commands.set('ping', new cmd.Ping());
    this.commands.set('set', new cmd.Set());

    // cloning map to avoid circular dependency
    this.commands.set('command', new cmd.Command(new Map(this.commands)));
  }

  private handleClientConnection(client: Socket): void {
    client.on('data', (data: Buffer) => {
      this.handleClientData(client, data);
    });
  }

  private handleClientData(client: Socket, data: Buffer): void {
    try {
      this.handleRequest(client, data);
    } catch (e) {
      console.error(e);
    }
  }

  private handleRequest(client: Socket, data: Buffer) {
    const request = decode(data);
    const commandName = String(request[0]);
    const command = this.commands.get(commandName.toLowerCase());

    if (command) {
      command.execute(client, request);
    } else {
      const reply = encodeError(`unknown command '${commandName}'`);
      client.write(reply);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listen(...args: any[]): Server {
    const server = createServer();

    server.on('connection', this.handleClientConnection.bind(this));

    return server.listen(...args);
  }
}
