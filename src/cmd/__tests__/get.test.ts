import Get from '../get';
import { Socket } from 'net';
import { get } from '../../db';

jest.mock('net', () => ({
  Socket: jest.fn().mockImplementation(() => ({
    write: jest.fn(),
  })),
}));

jest.mock('../../db', () => ({
  get: jest.fn().mockImplementation((key: string): string | undefined => {
    if (key === 'mykey') return 'myvalue';
    return undefined;
  }),
}));

describe('get command', () => {
  it('should have a name of get', () => {
    const command = new Get();
    expect(command.name).toBe('get');
  });

  it('should have an arity of 2', () => {
    const command = new Get();
    expect(command.arity).toBe(2);
  });

  it('should have the flag(s): write, fast', () => {
    const command = new Get();
    expect(command.flags.length).toBe(2);
    expect(command.flags[0]).toBe('readonly');
    expect(command.flags[1]).toBe('fast');
  });

  it('should have a firstKey of 1', () => {
    const command = new Get();
    expect(command.firstKey).toBe(1);
  });

  it('should have a lastKey of 1', () => {
    const command = new Get();
    expect(command.lastKey).toBe(1);
  });

  it('should have a keyStep of 1', () => {
    const command = new Get();
    expect(command.keyStep).toBe(1);
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('it should write the value of the key to the client as a bulk string if present', () => {
      const command = new Get();
      const client = new Socket();

      command.execute(client, ['get', 'mykey']);

      expect(get).toHaveBeenCalledWith('mykey');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('$7\r\nmyvalue\r\n');
    });

    it('it should write nil to the client if key does not exit', () => {
      const command = new Get();
      const client = new Socket();

      command.execute(client, ['get', 'absent']);

      expect(get).toHaveBeenCalledWith('absent');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('$-1\r\n');
    });
  });
});
