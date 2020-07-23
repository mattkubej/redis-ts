import { Socket } from 'net';

enum Command {
  PING = 'PING',
  ECHO = 'ECHO',
};

export function handle(client: Socket, cmd: string) {
  switch(cmd) {
    case Command.PING:
      client.write('+PONG\r\n');
      break;
    case Command.ECHO:
      console.log('TODO :: ', cmd);
      break;
  }
};
