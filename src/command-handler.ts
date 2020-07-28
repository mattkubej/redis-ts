import { Socket } from 'net';

enum Command {
  COMMAND = 'command',
  ECHO = 'echo',
  MONITOR = 'monitor',
  PING = 'ping',
};

export function handle(client: Socket, request: (number|string)[]) {
  console.log('-[request]-> ', request);
  const cmd = request[0];

  switch(String(cmd).toLowerCase()) {
    case Command.PING:
      ping(client);
      break;
    case Command.ECHO:
      echo(client, request);
      break;
    case Command.COMMAND:
      client.write('*6\r\n$3\r\nget\r\n:2\r\n*2\r\n+readonly\r\n+fast\r\n:1\r\n:1\r\n:1\r\n')
  }
};

function ping(client: Socket) {
  client.write('+PONG\r\n');
}

function echo(client: Socket, request: (number|string)[]) {
  // TODO: (error) ERR wrong number of arguments for 'echo' command
  const message = request[1];

  if (typeof message !== 'string') {
    // TODO: respond with error?
    return;
  }

  const length = message.length;

  // TODO: handle null value, "$-1\r\n"

  client.write(`$${length}\r\n${message}\r\n`);
}
