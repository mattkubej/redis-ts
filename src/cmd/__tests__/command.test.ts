import Command from '../command';
import { Socket } from 'net';
import RedisCommand from '../redis-command';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn(),
  }),
}));

class DummyClass extends RedisCommand {
  constructor(public name = 'dummy') {
    super(name, -1, ['flag'], 0, 0, 0);
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

    it('should reply with every commands info when receiving no arguments', () => {
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

    it("should reply with the requested command info when receiving 'info [name]'", () => {
      const commands = new Map();
      commands.set('dummy', new DummyClass());

      const command = new Command(commands);
      const client = new Socket();

      command.execute(client, ['command', 'info', 'dummy']);

      expect(client.write).toBeCalledWith(
        '*1\r\n' +
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

    it("should reply with the requested command's when receiving 'info [name1] [name2] ...", () => {
      const commands = new Map();
      commands.set('dummy1', new DummyClass('dummy1'));
      commands.set('dummy2', new DummyClass('dummy2'));
      commands.set('dummy3', new DummyClass('dummy3'));

      const command = new Command(commands);
      const client = new Socket();

      command.execute(client, [
        'command',
        'info',
        'dummy1',
        'dummy2',
        'dummy3',
      ]);

      expect(client.write).toBeCalledWith(
        '*3\r\n' +
          '*6\r\n' +
          '$6\r\n' +
          'dummy1\r\n' +
          ':-1\r\n' +
          '*1\r\n' +
          '+flag\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          '*6\r\n' +
          '$6\r\n' +
          'dummy2\r\n' +
          ':-1\r\n' +
          '*1\r\n' +
          '+flag\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          '*6\r\n' +
          '$6\r\n' +
          'dummy3\r\n' +
          ':-1\r\n' +
          '*1\r\n' +
          '+flag\r\n' +
          ':0\r\n' +
          ':0\r\n' +
          ':0\r\n'
      );
    });

    it("should return an array with a null bulk string when 'info [name]' has no matching command", () => {
      const command = new Command(new Map());
      const client = new Socket();

      command.execute(client, ['command', 'info', 'dummy']);

      expect(client.write).toBeCalledWith('*1\r\n$-1\r\n');
    });

    it("should return an empty array when receiving 'info' without a command", () => {
      const command = new Command(new Map());
      const client = new Socket();

      command.execute(client, ['command', 'info']);

      expect(client.write).toBeCalledWith('*0\r\n');
    });

    it("should return the number of commands when receiving 'count'", () => {
      const commands = new Map();
      commands.set('dummy1', new DummyClass('dummy1'));
      commands.set('dummy2', new DummyClass('dummy2'));
      commands.set('dummy3', new DummyClass('dummy3'));

      const command = new Command(commands);
      const client = new Socket();

      command.execute(client, ['command', 'count']);

      expect(client.write).toBeCalledWith(':4\r\n');
    });

    it('should throw an error when receiving an unknown subcommand', () => {
      expect(() => {
        const command = new Command(new Map());
        const client = new Socket();

        command.execute(client, ['command', 'fake']);
      }).toThrow(new Error('unknown subcommand or wrong number of arguments'));
    });

    it("should throw an error when receiving too many arguments for 'count'", () => {
      expect(() => {
        const command = new Command(new Map());
        const client = new Socket();

        command.execute(client, ['command', 'count', 'extra']);
      }).toThrow(new Error('unknown subcommand or wrong number of arguments'));
    });
  });
});
