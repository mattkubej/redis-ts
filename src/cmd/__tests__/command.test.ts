import Command from '../command';
import { Socket } from 'net';
import RedisCommand from '../redis-command';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn(),
  }),
}));

class DummyClass extends RedisCommand {
  constructor() {
    super('dummy', -1, ['flag'], 0, 0, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  execute(client: Socket, request: (number | string)[]): void {}
}

describe('command command', () => {
  it('should have a name of command', () => {
    const command = new Command(new Map());
    expect(command.name).toBe('command');
  });

  it('should have an arity of -1', () => {
    const command = new Command(new Map());
    expect(command.arity).toBe(-1);
  });

  it('should have the flag(s): loading, stale', () => {
    const command = new Command(new Map());
    expect(command.flags.length).toBe(2);
    expect(command.flags[0]).toBe('loading');
    expect(command.flags[1]).toBe('stale');
  });

  it('should have a firstKey of 0', () => {
    const command = new Command(new Map());
    expect(command.firstKey).toBe(0);
  });

  it('should have a lastKey of 0', () => {
    const command = new Command(new Map());
    expect(command.lastKey).toBe(0);
  });

  it('should have a keyStep of 0', () => {
    const command = new Command(new Map());
    expect(command.keyStep).toBe(0);
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('it should write an encoded array of commands to the client', () => {
      const commands = new Map();
      commands.set('dummy', new DummyClass());

      const command = new Command(commands);
      const client = new Socket();

      command.execute(client, ['command']);

      expect(client.write).toBeCalledWith(
        '*2\r\n' +
          '*6\r\n' +
          '$7\r\n' +
          'command\r\n' +
          ':-1\r\n' +
          '*2\r\n' +
          '+loading\r\n' +
          '+stale\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          '*6\r\n' +
          '$5\r\n' +
          'dummy\r\n' +
          ':-1\r\n' +
          '*1\r\n' +
          '+flag\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          ':0\r\n'
      );
    });
  });
});
