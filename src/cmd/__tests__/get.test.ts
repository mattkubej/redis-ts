import Get from '../get';
import { Socket } from 'net';
import { get } from '../../db';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn(),
  }),
}));

jest.mock('../../db', () => ({
  get: jest.fn().mockImplementation((key: string): string | null => {
    if (key === 'mykey') return 'myvalue';
    return null;
  }),
}));

describe('get command', () => {
  it('should have a name of get', () => {
    const command = new Get();
    expect(command.name).toBe('get');
  });

  it('should have an arity of -3', () => {
    const command = new Get();
    expect(command.arity).toBe(-3);
  });

  it('should have the flag(s): write, denyoom', () => {
    const command = new Get();
    expect(command.flags.length).toBe(2);
    expect(command.flags[0]).toBe('write');
    expect(command.flags[1]).toBe('denyoom');
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
      expect(client.write).toBeCalledWith('$7\r\nmyvalue\r\n');
    });
  });
});
