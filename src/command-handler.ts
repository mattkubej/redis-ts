import { Socket } from 'net';

enum Command {
  COMMAND = 'command',
  ECHO = 'echo',
  MONITOR = 'monitor',
  PING = 'ping',
};

export function handle(client: Socket, request: (number|string)[]) {
  console.log('-[request]-> ', request);
  const [cmd, ...args] = request;

  switch(String(cmd).toLowerCase()) {
    case Command.PING:
      client.write('+PONG\r\n');
      break;
    case Command.ECHO:
      console.log('TODO :: ', cmd);
      break;
    case Command.COMMAND:
      client.write('*6\r\n$3\r\nget\r\n:2\r\n*2\r\n+readonly\r\n+fast\r\n:1\r\n:1\r\n:1\r\n')
  }
};
