import Ping from '../ping';
import { Socket } from 'net';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn()
  })
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

    it('should write PONG as a simple string back to the client', () => {
      const command = new Ping();
      const client = new Socket(); 

      command.execute(client, ['ping']);
      expect(client.write).toBeCalledWith('+PONG\r\n');
    });
  });
});
