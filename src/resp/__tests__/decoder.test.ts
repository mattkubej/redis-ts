import { decode } from '../decoder';

describe('decode', () => {
  describe('simple string', () => {
    it('should decode an encoded simple string to a string', () => {
      const data = Buffer.from('+TEST\r\n');
      const result = decode(data);
      expect(result).toStrictEqual(['TEST']);
    });
  });

  describe('bulk string', () => {
    it('should decode an encoded bulk string to a string', () => {
      const data = Buffer.from('$4\r\nTEST\r\n');
      const result = decode(data);
      expect(result).toStrictEqual(['TEST']);
    });
  });

  describe('integer', () => {
    it('should decode an encoded integer to a number', () => {
      const data = Buffer.from(':2\r\n');
      const result = decode(data);
      expect(result).toStrictEqual([2]);
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
      }).toThrowError('BOOM');
    });
  });

  it('should throw an error when receiving an unknown prefix', () => {
    expect(() => {
      const data = Buffer.from('&error\r\n');
      decode(data);
    }).toThrowError("-ERR unknown data type prefix '&'");
  });
});
