import { createServer, Server, Socket } from 'net';
import { decode } from './resp-decoder';
import * as cmd from './cmd';

export default class RedisServer {
  private commands: Map<string, cmd.RedisCommand>;

  constructor() {
    this.commands = new Map();
    this.registerCommands();
  }

  private registerCommands() {
    this.commands.set('echo', new cmd.Echo());
    this.commands.set('ping', new cmd.Ping());
  }

  private handleRequest(client: Socket, data: Buffer) {
    const request = decode(data);
    const commandName = String(request[0]).toLowerCase();
    const command = this.commands.get(commandName);
    command.execute(client, request);
  }

  listen(...args: any[]): Server {
    const server = createServer();

    // TODO: clean this up
    server.on('connection', (socket) => {
      socket.on('data', (data) => {
        try {
          this.handleRequest(socket, data);
        } catch (e) {
          console.error(e);
        }
      });
    });

    return server.listen(...args);
  };
};
