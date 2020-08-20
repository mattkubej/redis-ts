import SetCommand from '../set';
import { Socket } from 'net';
import { get, set } from '../../db';

jest.mock('net', () => ({
  Socket: () => ({
    write: jest.fn(),
  }),
}));

jest.mock('../../db', () => ({
  set: jest.fn(),
  get: jest.fn().mockImplementation(() => undefined),
}));

describe('set command', () => {
  it('should have a name of set', () => {
    const command = new SetCommand();
    expect(command.name).toBe('set');
  });

  it('should have an arity of -3', () => {
    const command = new SetCommand();
    expect(command.arity).toBe(-3);
  });

  it('should have the flag(s): write, denyoom', () => {
    const command = new SetCommand();
    expect(command.flags.length).toBe(2);
    expect(command.flags[0]).toBe('write');
    expect(command.flags[1]).toBe('denyoom');
  });

  it('should have a firstKey of 1', () => {
    const command = new SetCommand();
    expect(command.firstKey).toBe(1);
  });

  it('should have a lastKey of 1', () => {
    const command = new SetCommand();
    expect(command.lastKey).toBe(1);
  });

  it('should have a keyStep of 1', () => {
    const command = new SetCommand();
    expect(command.keyStep).toBe(1);
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should save the key and value to the db and respond with OK to the client', () => {
      const command = new SetCommand();
      const client = new Socket();

      command.execute(client, ['set', 'mykey', 'myvalue']);

      expect(set).toHaveBeenCalledWith('mykey', 'myvalue');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('+OK\r\n');
    });

    it('should save the key and value when NX is provided and the key does not exist', () => {
      const command = new SetCommand();
      const client = new Socket();

      command.execute(client, ['set', 'mykey', 'myvalue', 'NX']);

      expect(set).toHaveBeenCalledWith('mykey', 'myvalue');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('+OK\r\n');
    });

    it('should not save the key and value when NX is provided and the key exists', () => {
      (get as jest.Mock).mockImplementation((key) => {
        return key === 'mykey' ? 'myvalue' : undefined;
      });

      const command = new SetCommand();
      const client = new Socket();

      command.execute(client, ['set', 'mykey', 'myvalue', 'NX']);

      expect(set).not.toHaveBeenCalledWith('mykey', 'myvalue');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('$-1\r\n');
    });

    it('should save the key and value when XX is provided and the key exists', () => {
      (get as jest.Mock).mockImplementation((key) => {
        return key === 'mykey' ? 'myvalue' : undefined;
      });

      const command = new SetCommand();
      const client = new Socket();

      command.execute(client, ['set', 'mykey', 'myvalue', 'XX']);

      expect(set).toHaveBeenCalledWith('mykey', 'myvalue');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('+OK\r\n');
    });

    it('should not save the key and value when XX is provided and the key does not exist', () => {
      const command = new SetCommand();
      const client = new Socket();

      command.execute(client, ['set', 'mykey', 'myvalue', 'XX']);

      expect(set).not.toHaveBeenCalledWith('mykey', 'myvalue');
      expect(client.write).toHaveBeenCalledTimes(1);
      expect(client.write).toBeCalledWith('$-1\r\n');
    });

    it('should throw a syntax error when receiving unknown options', () => {
      const command = new SetCommand();
      const client = new Socket();

      expect(() => {
        command.execute(client, ['set', 'mykey', 'myvalue', 'MM']);
      }).toThrow(new Error('syntax error'));
      expect(client.write).toHaveBeenCalledTimes(0);
    });
  });
});
