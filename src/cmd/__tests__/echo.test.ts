import Echo from '../echo';
import { Socket } from 'net';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn()
  })
}));

describe('echo command', () => {
  it('should have a name of echo', () => {
    const command = new Echo();
    expect(command.name).toBe('echo');
  });

  it('should have an arity of ', () => {
    const command = new Echo();
    expect(command.arity).toBe(2);
  });

  it('should have the flag(s): fast', () => {
    const command = new Echo();
    expect(command.flags.length).toBe(1);
    expect(command.flags[0]).toBe('fast');
  });

  it('should have a firstKey of 0', () => {
    const command = new Echo();
    expect(command.firstKey).toBe(0);
  });

  it('should have a lastKey of 0', () => {
    const command = new Echo();
    expect(command.lastKey).toBe(0);
  });

  it('should have a keyStep of 0', () => {
    const command = new Echo();
    expect(command.keyStep).toBe(0);
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should write the first argument (string) back to the client as a bulk string', () => {
      const command = new Echo();
      const client = new Socket(); 

      command.execute(client, ['echo', 'hello world']);
      expect(client.write).toBeCalledWith('$11\r\nhello world\r\n');
    });

    it('should write the first argument (number) back to the client as a bulk string', () => {
      const command = new Echo();
      const client = new Socket(); 

      command.execute(client, ['echo', 24]);
      expect(client.write).toBeCalledWith('$2\r\n24\r\n');
    });
  });
});
