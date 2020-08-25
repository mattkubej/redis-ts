import { decode } from '../decoder';

describe('decode', () => {
  describe('simple string', () => {
    it('should decode an encoded simple string to a string', () => {
      const data = Buffer.from('+TEST\r\n');
      const result = decode(data);
      expect(result).toBe('TEST');
    });
  });

  describe('bulk string', () => {
    it('should decode an encoded bulk string to a string', () => {
      const data = Buffer.from('$4\r\nTEST\r\n');
      const result = decode(data);
      expect(result).toBe('TEST');
    });

    it('should decode a null encoded bulk string to null', () => {
      const data = Buffer.from('$-1\r\n');
      const result = decode(data);
      expect(result).toBeNull();
    });
  });

  describe('integer', () => {
    it('should decode an encoded integer to a number', () => {
      const data = Buffer.from(':2\r\n');
      const result = decode(data);
      expect(result).toBe(2);
    });
  });

  describe('array', () => {
    it('should decode an encoded array to array', () => {
      const data = Buffer.from('*2\r\n+TEST\r\n*2\r\n$4\r\nABCD\r\n:2\r\n');
      const result = decode(data);
      expect(result).toStrictEqual(['TEST', ['ABCD', 2]]);
    });
  });

  describe('error', () => {
    it('should decode an encoded error to a thrown error', () => {
      expect(() => {
        const data = Buffer.from('-BOOM\r\n');
        decode(data);
      }).toThrow(new Error('BOOM'));
    });
  });

  it('should throw an error when receiving an unknown prefix', () => {
    expect(() => {
      const data = Buffer.from('&error\r\n');
      decode(data);
    }).toThrow(new Error("Protocol error: unknown data type prefix '&'"));
  });
});
