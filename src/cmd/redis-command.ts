import { Socket } from 'net';
import { Data } from '../resp/constants';

export default abstract class RedisCommand {
  constructor(
    public name: string,
    public arity: number,
    public flags: string[],
    public firstKey: number,
    public lastKey: number,
    public keyStep: number
  ) {}

  abstract execute(client: Socket, request: Data[]): void;
}
