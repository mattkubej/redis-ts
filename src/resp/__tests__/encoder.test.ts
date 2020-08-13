import {
  encodeSimpleString,
  encodeBulkString,
  encodeInteger,
  encodeArray,
  encodeError,
} from '../encoder';

describe('encoder', () => {
  describe('encodeSimpleString', () => {
    it('should encode the value to a simple string', () => {
      const result = encodeSimpleString('OK');
      expect(result).toBe('+OK\r\n');
    });
  });

  describe('encodeBulkString', () => {
    it('should encode the value to a bulk string', () => {
      const result = encodeBulkString('matt');
      expect(result).toBe('$4\r\nmatt\r\n');
    });
  });

  describe('encodeInteger', () => {
    it('should encode the value to an integer', () => {
      const result = encodeInteger(1);
      expect(result).toBe(':1\r\n');
    });
  });

  describe('encodeArray', () => {
    it('should encode the values to an array', () => {
      const result = encodeArray(['+one\r\n', '+two\r\n']);
      expect(result).toBe('*2\r\n+one\r\n+two\r\n');
    });
  });

  describe('encodeError', () => {
    it('should encode the value to an error', () => {
      const result = encodeError('something bad');
      expect(result).toBe('-ERR something bad\r\n');
    });
  });
});
