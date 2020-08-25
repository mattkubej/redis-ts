import { Data, CR, LF, CRLF, Prefix } from './constants';

type Token = {
  value: Data; // TODO: consider renaming value
  offset: number;
};

export function decode(value: Buffer): Data {
  const { value: result, offset } = parse(value);

  if (offset !== value.length) {
    throw new Error('read values do not match buffer length');
  }

  if (result instanceof Array) {
    return result;
  }

  return result;
}

function parse(value: Buffer, offset = 0): Token {
  const prefix = String.fromCharCode(value.readUInt8(offset++));

  switch (prefix) {
    case Prefix.SimpleString:
      return decodeSimpleString(value, offset);
    case Prefix.BulkString:
      return decodeBulkString(value, offset);
    case Prefix.Array:
      return decodeArray(value, offset);
    case Prefix.Integer:
      return decodeInteger(value, offset);
    case Prefix.Error: {
      const error = readNext(value, offset);
      throw new Error(error);
    }
    default:
      throw new Error(`unknown data type prefix '${prefix}'`);
  }
}

function readNext(value: Buffer, offset = 0): string {
  let token = '';
  let char = '';

  while (char !== CR) {
    token += char;
    char = String.fromCharCode(value.readUInt8(offset++));
  }

  const nextByte = String.fromCharCode(value.readUInt8(offset++));
  if (nextByte !== LF) {
    throw new Error('ill-formed token, expected LF');
  }

  return token;
}

function decodeSimpleString(value: Buffer, offset: number): Token {
  const token = readNext(value, offset);

  return {
    value: token,
    offset: offset + token.length + CRLF.length,
  };
}

function decodeBulkString(value: Buffer, offset: number): Token {
  const token = readNext(value, offset);
  const bytes = parseInt(token, 10);
  offset += token.length + CRLF.length;

  if (bytes === -1) {
    return {
      value: null,
      offset,
    };
  }

  // TODO: investigate not matching bytes
  const bulkString = readNext(value, offset);
  offset += bytes + CRLF.length;

  return {
    value: bulkString,
    offset,
  };
}

function decodeArray(value: Buffer, offset: number): Token {
  const token = readNext(value, offset);
  const count = parseInt(token, 10);
  offset += token.length + CRLF.length;

  const elements = [];
  for (let i = 0; i < count; i++) {
    const token = parse(value, offset);
    offset = token.offset;
    elements.push(token.value);
  }

  return {
    value: elements,
    offset,
  };
}

function decodeInteger(value: Buffer, offset: number): Token {
  const token = readNext(value, offset);
  const integer = parseInt(token, 10);
  offset += token.length + CRLF.length;

  return {
    value: integer,
    offset,
  };
}
