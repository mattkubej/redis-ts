import Quit from '../quit';
import { Socket } from 'net';

jest.mock('net', () => ({
  Socket: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    write: jest.fn(),
  })),
}));

describe('quit command', () => {
  it('should have a name of quit', () => {
    const command = new Quit();
    expect(command.name).toBe('quit');
  });

  it('should have an arity of 1', () => {
    const command = new Quit();
    expect(command.arity).toBe(1);
  });

  it('should have the flag(s): fast', () => {
    const command = new Quit();
    expect(command.flags.length).toBe(1);
    expect(command.flags[0]).toBe('fast');
  });

  it('should have a firstKey of 0', () => {
    const command = new Quit();
    expect(command.firstKey).toBe(0);
  });

  it('should have a lastKey of 0', () => {
    const command = new Quit();
    expect(command.lastKey).toBe(0);
  });

  it('should have a keyStep of 0', () => {
    const command = new Quit();
    expect(command.keyStep).toBe(0);
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should reply with OK and close the connection', () => {
      const command = new Quit();
      const client = new Socket();

      command.execute(client, ['quit']);

      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('+OK\r\n');
      expect(client.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
