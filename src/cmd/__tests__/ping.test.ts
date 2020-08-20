import Ping from '../ping';
import { Socket } from 'net';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn(),
  }),
}));

describe('ping command', () => {
  it('should have a name of ping', () => {
    const command = new Ping();
    expect(command.name).toBe('ping');
  });

  it('should have an arity of -1', () => {
    const command = new Ping();
    expect(command.arity).toBe(-1);
  });

  it('should have the flag(s): stale, fast', () => {
    const command = new Ping();
    expect(command.flags.length).toBe(2);
    expect(command.flags[0]).toBe('stale');
    expect(command.flags[1]).toBe('fast');
  });

  it('should have a firstKey of 0', () => {
    const command = new Ping();
    expect(command.firstKey).toBe(0);
  });

  it('should have a lastKey of 0', () => {
    const command = new Ping();
    expect(command.lastKey).toBe(0);
  });

  it('should have a keyStep of 0', () => {
    const command = new Ping();
    expect(command.keyStep).toBe(0);
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error when receiving two or more arguments', () => {
      const command = new Ping();
      const client = new Socket();

      expect(() => {
        command.execute(client, ['ping', 'test', 'test']);
      }).toThrow(new Error("wrong number of arguments for 'ping' command"));
      expect(client.write).toHaveBeenCalledTimes(0);
    });

    it('should reply with PONG when no message argument provided', () => {
      const command = new Ping();
      const client = new Socket();

      command.execute(client, ['ping']);

      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('+PONG\r\n');
    });

    it('should reply with the message argument when provided', () => {
      const command = new Ping();
      const client = new Socket();

      command.execute(client, ['ping', 'test']);

      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('+test\r\n');
    });
  });
});
