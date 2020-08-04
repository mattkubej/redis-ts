import { Socket } from 'net';

export default abstract class RedisCommand {
  constructor(public name: string, public arity: number, 
              public flags: string[], public firstKey: number,
              public lastKey: number, public keyStep: number) {
  }

  abstract execute(client: Socket, request: (number|string)[]): void;
}
