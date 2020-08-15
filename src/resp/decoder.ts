import { CRLF, RESPType } from './constants';

type Token = {
  value: number | string | (string | number)[];
  readIndex: number;
};

export function decode(value: Buffer): number | string | (string | number)[] {
  const { value: result, readIndex } = parse(value);

  if (readIndex !== value.length) {
    throw new Error('read values do not match buffer length');
  }

  if (result instanceof Array) {
    return result;
  }

  return result;
}

// TODO: account for inline commands, support telnet
function parse(value: Buffer, readIndex = 0): Token {
  const type = value.toString('utf8', readIndex, ++readIndex);

  switch (type) {
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
      break;
    default:
      throw new Error(`unknown data type prefix '${type}'`);
  }
}

// TODO: investigate more performant solution than indexOf
function decodeSimpleString(value: Buffer, readIndex: number): Token {
  const simpleStringTerm = value.indexOf(CRLF, readIndex);
  const simpleString = value.toString('utf8', readIndex, simpleStringTerm);
  readIndex = simpleStringTerm + CRLF.length;

  return {
    value: simpleString,
    readIndex,
  };
}

function decodeBulkString(value: Buffer, readIndex: number): Token {
  const bytesTerm = value.indexOf(CRLF, readIndex);
  const bytes = parseInt(value.toString('utf8', readIndex, bytesTerm), 10);
  readIndex = bytesTerm + CRLF.length;

  // TODO: return null byte that conforms with RESP
  if (bytes === -1) {
    return null;
  }

  const bulkString = value.toString('utf8', readIndex, readIndex + bytes);
  readIndex = readIndex + bytes + CRLF.length;

  return {
    value: bulkString,
    readIndex,
  };
}

function decodeArray(value: Buffer, readIndex: number): Token {
  const countTerm = value.indexOf(CRLF, readIndex);
  const count = parseInt(value.toString('utf8', readIndex, countTerm), 10);
  readIndex = countTerm + CRLF.length;

  const elements = [];
  for (let i = 0; i < count; i++) {
    const token = parse(value, readIndex);
    readIndex = token.readIndex;
    elements.push(token.value);
  }

  return {
    value: elements,
    readIndex,
  };
}

function decodeInteger(value: Buffer, readIndex: number): Token {
  const integerTerm = value.indexOf(CRLF, readIndex);
  const integer = parseInt(value.toString('utf8', readIndex, integerTerm), 10);
  readIndex = integerTerm + CRLF.length;

  return {
    value: integer,
    readIndex,
  };
}

function decodeError(value: Buffer, readIndex: number): Token {
  const errorTerm = value.indexOf(CRLF, readIndex);
  const error = value.toString('utf8', readIndex, errorTerm);

  throw new Error(error);
}
