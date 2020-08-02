import { CRLF, RESPType } from './constants';

type Token = {
  value: number | string | (string|number)[];
  readIndex: number;
};

// TODO: improve error handling
export function decode(value: Buffer): (string|number)[] {
  const { value: result, readIndex} = parse(value);

  if (readIndex !== value.length) {
    throw new Error('Read values does not match buffer length.');
  }

  if (result instanceof Array) {
    return result;
  }

  // TODO: might be incorrect, should not force an array
  return [result];
};

// TODO: account for inline commands, support telnet
function parse(value: Buffer, readIndex: number = 0): Token {
  const type = value.toString('utf8', readIndex, ++readIndex);

  switch(type) {
    case RESPType.SimpleString:
      return decodeSimpleString(value, readIndex);
    case RESPType.BulkString:
      return decodeBulkString(value, readIndex);
    case RESPType.Array:
      return decodeArray(value, readIndex);
    case RESPType.Integer:
      return decodeInteger(value, readIndex);
    case RESPType.Error:
      decodeError(value, readIndex);
    default:
      throw new Error(`Unrecognized type: ${type}`);
  }
};

// TODO: clean up implementation
function decodeSimpleString(value: Buffer, readIndex: number): Token {
  const simpleStringTerm = value.indexOf(CRLF, readIndex); 
  const simpleString = value.toString('utf8', readIndex, simpleStringTerm);

  return {
    value: simpleString,
    readIndex: simpleStringTerm + CRLF.length
  };
};

// TODO: clean up implementation
function decodeBulkString(value: Buffer, readIndex: number): Token {
  const bytesTerm = value.indexOf(CRLF, readIndex); 
  const bytes = parseInt(value.toString('utf8', readIndex, bytesTerm), 10);
  readIndex = bytesTerm + CRLF.length;

  if (bytes === -1) {
    return null;
  }

  const bulkString = value.toString('utf8', readIndex, readIndex + bytes);

  return {
    value: bulkString,
    readIndex: readIndex + bytes + CRLF.length 
  };
};

// TODO: clean up implementation
function decodeArray(value: Buffer, readIndex: number): Token {
  const countTerm = value.indexOf(CRLF, readIndex);
  const count = Number(value.toString('utf8', readIndex, countTerm));
  readIndex = countTerm + CRLF.length;

  const elements = [];
  for (let i = 0; i < count; i++) {
    const token = parse(value, readIndex);
    readIndex = token.readIndex;
    elements.push(token.value);
  }

  return {
    value: elements,
    readIndex: readIndex
  };
};

function decodeInteger(value: Buffer, readIndex: number): Token {
  const integerTerm = value.indexOf(CRLF, readIndex); 
  const integer = parseInt(value.toString('utf8', readIndex, integerTerm), 10);

  return {
    value: integer,
    readIndex: integerTerm + CRLF.length
  };
};

function decodeError(value: Buffer, readIndex: number): Token {
  const errorTerm = value.indexOf(CRLF, readIndex); 
  const error = value.toString('utf8', readIndex, errorTerm);

  throw new Error(error);
};
